import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChromaService } from './chroma.service';
import { RagService } from '../rag/rag.service';

@Module({
  imports: [
    ConfigModule, // <-- Added to make ConfigService available
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('UPLOAD_DIR'),
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}-${file.originalname}`);
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ResumeController],
  providers: [ResumeService, PrismaService, ChromaService, RagService],
})
export class ResumeModule {}