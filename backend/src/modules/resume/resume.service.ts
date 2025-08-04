import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createReadStream, readFileSync } from 'fs';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { RagService } from '../rag/rag.service';
import { ChromaService } from './chroma.service';
import { Resume, ResumeAnalysis, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

@Injectable()
export class ResumeService {
  constructor(
    private prisma: PrismaService,
    private ragService: RagService,
    private chromaService: ChromaService,
  ) {}

  /**
   * Helper function to chunk text
   * @param text The text to chunk
   * @param chunkSize The size of each chunk
   * @param overlap The overlap between chunks
   */
  private chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }
    return chunks;
  }

  /**
   * Upload and process a resume file
   * @param user Authenticated user
   * @param file Uploaded file (PDF/DOCX)
   */
  async uploadResume(
    user: { id: number } | { userId: number },
    file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Save file path and metadata in DB before parsing
    const resume = await this.prisma.resume.create({
      data: {
        userId: 'userId' in user ? user.userId : user.id,
        filename: file.originalname,
        path: file.path, // Save the file path in /uploads
        content: null,   // Will update after parsing
      },
    });

    let textContent: string;
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: file.path });
      textContent = result.value;
    } else {
      throw new BadRequestException('Unsupported file type');
    }

    // Update resume with parsed content
    await this.prisma.resume.update({
      where: { id: resume.id },
      data: { content: textContent },
    });

    // Chunk the resume content
    const chunks = this.chunkText(textContent, 500, 100);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.ragService.getEmbedding(chunk);
      await this.chromaService.addResumeEmbedding(
        `${resume.id}_chunk_${i}`,
        embedding,
        chunk // store the chunk text
        // optionally, add metadata: { chunkIndex: i, resumeId: resume.id }
      );
    }

    // Get AI analysis (Ollama LLM)
    const analysis = await this.ragService.analyzeResume(textContent);

    // Save analysis
    await this.prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        skills: analysis.skills,
        score: analysis.score,
        suggestions: Array.isArray(analysis.suggestions)
          ? analysis.suggestions.join('\n')
          : analysis.suggestions,
      },
    });

    return this.prisma.resume.findUnique({
      where: { id: resume.id },
      include: { analysis: true },
    });
  }

  async getResumeById(id: number, userId: number) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
      include: { analysis: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async getResumeMatches(id: number, userId: number) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Aggregate all chunk embeddings for this resume
    const chunkEmbeddings: number[][] = [];
    let chunkIndex = 0;
    while (true) {
      const chunkId = `${id}_chunk_${chunkIndex}`;
      console.log('Trying to fetch embedding for:', chunkId);
      const embedding = await this.chromaService.getResumeEmbedding(chunkId);
      if (!embedding) {
        console.log('No embedding found for:', chunkId);
        break;
      }
      console.log('Found embedding for:', chunkId, 'Length:', embedding.length);
      chunkEmbeddings.push(embedding);
      chunkIndex++;
    }
    console.log('Total chunk embeddings found:', chunkEmbeddings.length);

    if (chunkEmbeddings.length === 0) {
      // No embeddings found for this resume, return empty array instead of 404
      console.warn(`No embeddings found for resume ${id}`);
      return [];
    }

    // Average the embeddings
    const avgEmbedding = chunkEmbeddings[0].map((_, i) =>
      chunkEmbeddings.reduce((sum, emb) => sum + emb[i], 0) / chunkEmbeddings.length
    );

    // Find similar jobs using the average embedding
    const matches = await this.chromaService.findSimilarJobs(avgEmbedding);

    // Fetch full job info from DB
    const jobIds = matches.map((m: any) => Number(m.id.replace('job_', '')));
    const jobs = await this.prisma.job.findMany({
      where: { id: { in: jobIds } },
    });

    // Merge Chroma match info with job info
    return jobs.map((job) => {
      const match = matches.find((m: any) => m.id === `job_${job.id}`);
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        skills: job.skills,
        score: Math.round((1 - (match?.distance ?? 0)) * 100), // or another scoring formula
        distance: match?.distance,
        // Optionally, add skillsMatched, etc.
      };
    });
  }

  /**
   * Re-embed all existing resumes for all users (utility for migration/fixing old data)
   */
  async reembedAllResumes() {
    const resumes = await this.prisma.resume.findMany({ include: { user: true } });
    let processed = 0;
    for (const resume of resumes) {
      if (!resume.content) {
        console.warn(`Skipping resume ${resume.id} (no content)`);
        continue;
      }
      try {
        const chunks = this.chunkText(resume.content, 500, 100);
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const embedding = await this.ragService.getEmbedding(chunk);
          await this.chromaService.addResumeEmbedding(
            `${resume.id}_chunk_${i}`,
            embedding,
            chunk
          );
        }
        processed++;
        console.log(`Re-embedded resume ${resume.id} (${resume.filename}) for user ${resume.userId}`);
      } catch (err) {
        console.error(`Failed to re-embed resume ${resume.id}:`, err);
      }
    }
    return { processed, total: resumes.length };
  }

  /**
   * Re-embed a single resume by ID
   */
  async reembedResumeById(resumeId: number) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || !resume.content) {
      throw new NotFoundException('Resume not found or has no content');
    }
    const chunks = this.chunkText(resume.content, 500, 100);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.ragService.getEmbedding(chunk);
      await this.chromaService.addResumeEmbedding(
        `${resume.id}_chunk_${i}`,
        embedding,
        chunk
      );
    }
    return { reembedded: true, resumeId };
  }

  /**
   * Re-embed only resumes missing embeddings in ChromaDB
   */
  async reembedMissingResumes() {
    const resumes = await this.prisma.resume.findMany();
    let processed = 0;
    for (const resume of resumes) {
      let hasEmbedding = false;
      let chunkIndex = 0;
      while (true) {
        const chunkId = `${resume.id}_chunk_${chunkIndex}`;
        const embedding = await this.chromaService.getResumeEmbedding(chunkId);
        if (!embedding) break;
        hasEmbedding = true;
        chunkIndex++;
      }
      if (!hasEmbedding && resume.content) {
        try {
          const chunks = this.chunkText(resume.content, 500, 100);
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await this.ragService.getEmbedding(chunk);
            if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
              console.error('Failed to get embedding for chunk', `${resume.id}_chunk_${i}`, 'Content:', chunk);
              continue;
            }
            await this.chromaService.addResumeEmbedding(
              `${resume.id}_chunk_${i}`,
              embedding,
              chunk
            );
          }
          processed++;
          console.log(`Re-embedded missing resume ${resume.id} (${resume.filename})`);
        } catch (err) {
          console.error(`Failed to re-embed missing resume ${resume.id}:`, err);
        }
      }
    }
    return { processed, total: resumes.length };
  }

  /**
   * Force re-embed all resumes with detailed output for each chunk
   */
  async forceReembedAllResumesWithLogs() {
    const resumes = await this.prisma.resume.findMany();
    let processed = 0;
    for (const resume of resumes) {
      if (!resume.content) {
        console.warn(`Skipping resume ${resume.id} (no content)`);
        continue;
      }
      try {
        const chunks = this.chunkText(resume.content, 500, 100);
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          let embedding;
          try {
            embedding = await this.ragService.getEmbedding(chunk);
          } catch (err) {
            console.error(`Failed to get embedding for chunk ${resume.id}_chunk_${i}:`, err);
            continue;
          }
          if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            console.error('Invalid embedding for chunk', `${resume.id}_chunk_${i}`, 'Content:', chunk);
            continue;
          }
          try {
            await this.chromaService.addResumeEmbedding(
              `${resume.id}_chunk_${i}`,
              embedding,
              chunk
            );
            console.log(`Successfully embedded chunk ${resume.id}_chunk_${i}`);
          } catch (err) {
            console.error(`Failed to upsert embedding for chunk ${resume.id}_chunk_${i}:`, err);
          }
        }
        processed++;
        console.log(`Force re-embedded resume ${resume.id} (${resume.filename})`);
      } catch (err) {
        console.error(`Failed to force re-embed resume ${resume.id}:`, err);
      }
    }
    return { processed, total: resumes.length };
  }

  /**
   * Get all resumes for a user, including analysis
   */
  async getUserResumes(user: { id: number } | { userId: number }) {
    const userId = 'userId' in user ? user.userId : user.id;
    return this.prisma.resume.findMany({
      where: { userId },
      include: { analysis: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * TEMP: Seed 100 fake resumes with content and embed them in ChromaDB
   */
  async seedAndEmbedResumes(count = 100) {
    let processed = 0;
    for (let i = 0; i < count; i++) {
      const fakeContent = faker.lorem.paragraphs(5);
      const fakeFilename = `resume_${faker.string.uuid()}.pdf`;
      const user = await this.prisma.user.findFirst(); // assign to first user
      if (!user) throw new Error('No user found to assign resumes');
      const resume = await this.prisma.resume.create({
        data: {
          userId: user.id,
          filename: fakeFilename,
          path: '',
          content: fakeContent,
        },
      });
      // Embed
      const chunks = this.chunkText(fakeContent, 500, 100);
      for (let j = 0; j < chunks.length; j++) {
        const chunk = chunks[j];
        const embedding = await this.ragService.getEmbedding(chunk);
        await this.chromaService.addResumeEmbedding(
          `${resume.id}_chunk_${j}`,
          embedding,
          chunk
        );
      }
      processed++;
      console.log(`Seeded and embedded resume ${resume.id}`);
    }
    return { processed };
  }



  async printResumeChunkIds(resumeId: number) {
    const ids = await this.chromaService.listResumeChunkIds(resumeId);
    console.log('All chunk IDs for resume', resumeId, ':', ids);
    return ids;
  }

  /**
   * Verify all resumes and jobs have embeddings in ChromaDB
   */
  async verifyAllEmbeddings() {
    // Check resumes
    const resumes = await this.prisma.resume.findMany();
    const resumesMissingEmbeddings: number[] = [];
    for (const resume of resumes) {
      let hasEmbedding = false;
      let chunkIndex = 0;
      while (true) {
        const chunkId = `${resume.id}_chunk_${chunkIndex}`;
        const embedding = await this.chromaService.getResumeEmbedding(chunkId);
        if (!embedding) break;
        hasEmbedding = true;
        chunkIndex++;
      }
      if (!hasEmbedding) {
        resumesMissingEmbeddings.push(resume.id);
      }
    }

    // Check jobs
    const jobs = await this.prisma.job.findMany();
    const jobsMissingEmbeddings: number[] = [];
    for (const job of jobs) {
      const jobId = `job_${job.id}`;
      const embedding = await this.chromaService.getResumeEmbedding(jobId); // Reuse getResumeEmbedding for jobs
      if (!embedding) {
        jobsMissingEmbeddings.push(job.id);
      }
    }

    console.log('Resumes missing embeddings:', resumesMissingEmbeddings);
    console.log('Jobs missing embeddings:', jobsMissingEmbeddings);
    return {
      resumesMissingEmbeddings,
      jobsMissingEmbeddings,
      totalResumes: resumes.length,
      totalJobs: jobs.length,
    };
  }



  async getResumeEmbeddings(id: number) {
    const embeddings: { chunkId: string; embedding: number[] }[] = [];
    let chunkIndex = 0;
    while (true) {
      const chunkId = `${id}_chunk_${chunkIndex}`;
      const embedding = await this.chromaService.getResumeEmbedding(chunkId);
      if (!embedding) break;
      embeddings.push({ chunkId, embedding });
      chunkIndex++;
    }
    return embeddings;
  }


}