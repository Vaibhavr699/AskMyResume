import { Injectable, OnModuleInit } from '@nestjs/common';
import { CloudClient } from 'chromadb';
import { ConfigService } from '@nestjs/config';
import { RagService } from '../rag/rag.service';

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: CloudClient;
  private collection: any;

  constructor(
    private configService: ConfigService,
    private ragService: RagService,
  ) {}

  async onModuleInit() {
    this.client = new CloudClient({
      apiKey: this.configService.get<string>('CHROMA_API_KEY'),
      tenant: this.configService.get<string>('CHROMA_TENANT'),
      database: this.configService.get<string>('CHROMA_DATABASE'),
    });

    const collectionName = this.configService.get<string>('CHROMA_COLLECTION') || 'resumes_and_jobs';
    try {
      this.collection = await this.client.getCollection({
        name: collectionName,
      });
    } catch (e: any) {
      // If the collection does not exist, create it
      if (e.message && e.message.includes('not found')) {
        this.collection = await this.client.createCollection({
          name: collectionName,
        });
      } else if (e.message && e.message.includes('already exists')) {
        // If it already exists, get it again
        this.collection = await this.client.getCollection({
          name: collectionName,
        });
      } else {
        throw e;
      }
    }
  }

  async addResumeEmbedding(id: string, embedding: number[], text: string) {
    await this.collection.add({
      ids: [id],
      embeddings: [embedding],
      metadatas: [{ type: 'resume' }],
      documents: [text as string], // Explicitly type as string
    });
  }

  async addJobEmbedding(id: string, embedding: number[], text: string) {
    await this.collection.add({
      ids: [id],
      embeddings: [embedding],
      metadatas: [{ type: 'job' }],
      documents: [text as string], // Explicitly type as string
    });
  }

  async getResumeEmbedding(id: string): Promise<number[] | undefined> {
    const result = await this.collection.get({
      ids: [id],
    });
    if (!result.embeddings || !result.embeddings[0] || result.embeddings[0].length === 0) {
      console.log('ChromaDB: No embedding found for', id, 'Result:', result);
      return undefined;
    }
    console.log('ChromaDB: Found embedding for', id, 'Length:', result.embeddings[0].length);
    return result.embeddings[0];
  }

  async getJobEmbedding(id: string): Promise<number[] | undefined> {
    const result = await this.collection.get({
      ids: [id],
    });
    if (!result.embeddings || !result.embeddings[0] || result.embeddings[0].length === 0) {
      console.log('ChromaDB: No embedding found for', id, 'Result:', result);
      return undefined;
    }
    console.log('ChromaDB: Found embedding for', id, 'Length:', result.embeddings[0].length);
    return result.embeddings[0];
  }

  async findSimilarJobs(embedding: number[], limit = 5) {
    const results = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
      where: { type: 'job' },
    });

    return results.ids[0].map((id: string, index: number) => ({
      id,
      distance: results.distances[0][index],
      document: results.documents[0][index],
    }));
  }

  async listResumeChunkIds(resumeId: number): Promise<string[]> {
    // List all IDs in the collection and filter for this resume's chunks
    const results = await this.collection.get({});
    return results.ids.filter((id: string) => id.startsWith(`${resumeId}_chunk_`));
  }

  async debugPrintResumeChunkEmbeddings(resumeId: number): Promise<void> {
    let chunkIndex = 0;
    while (true) {
      const chunkId = `${resumeId}_chunk_${chunkIndex}`;
      const result = await this.collection.get({ ids: [chunkId] });
      if (!result.embeddings || !result.embeddings[0]) {
        console.log(`No embedding found for chunkId: ${chunkId}`);
        break;
      }
      console.log(`Embedding for ${chunkId}:`, result.embeddings[0]);
      chunkIndex++;
    }
  }

  /**
   * Delete a single embedding by ID from the collection
   */
  async deleteEmbeddingById(id: string) {
    await this.collection.delete({ ids: [id] });
  }
}