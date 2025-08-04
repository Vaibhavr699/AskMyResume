import { Controller, Post, UploadedFile, UseInterceptors, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdf from 'pdf-parse';
import { RagService } from './rag.service';
import { VectorDbService } from './vector-db.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly vectorDb: VectorDbService,
    private readonly prisma: PrismaService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    const text = (await pdf(file.buffer)).text;
    const embedding = await this.ragService.getEmbedding(text);
    await this.vectorDb.addDocument(file.originalname, text, embedding, 'resume');
    return { message: 'Resume processed', embedding };
  }



  @Post('chat')
  async chat(@Body() body: { resumeId: string, question: string }) {
    try {
      // Get the resume content from the database first
      const resume = await this.prisma.resume.findUnique({
        where: { id: parseInt(body.resumeId) }
      });
      
      if (!resume || !resume.content) {
        throw new Error('Resume not found or has no content');
      }
      
      // Use the resume content as context
      const answer = await this.ragService.generateResponse(resume.content, body.question);
      return { answer };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}
