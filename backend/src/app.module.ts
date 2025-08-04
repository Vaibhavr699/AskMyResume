import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AdminModule } from './modules/admin/admin.module';
import { ResumeModule } from './modules/resume/resume.module';
import { RagController } from './modules/rag/rag.controller';
import { RagService } from './modules/rag/rag.service';
import { VectorDbService } from './modules/rag/vector-db.service';

import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, 
    UserModule, 
    AdminModule, 
    ResumeModule, 

  ],
  controllers: [AppController, RagController],
  providers: [AppService, RagService, VectorDbService, PrismaService],
})
export class AppModule {}
