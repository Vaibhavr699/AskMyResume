import { Controller, Get, Post, UseGuards, UploadedFile, UseInterceptors, Req, Param, Body, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResumeService } from './resume.service';
import { Request } from 'express';

@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * Get all resumes for the logged-in user
   * GET /resumes
   * Requires: Bearer JWT token
   * Returns: Array of resumes with analysis
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserResumes(@Req() req: Request) {
    const user = req.user as any;
    return this.resumeService.getUserResumes(user);
  }

  /**
   * Upload a resume file (PDF/DOCX)
   * POST /resumes/upload
   * Requires: Bearer JWT token
   * Returns: Resume with analysis
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    // req.user is set by JwtStrategy
    const user = req.user as any;
    return this.resumeService.uploadResume(user, file);
  }

  /**
   * TEMP: Re-embed all resumes for all users (admin/migration utility)
   * POST /resumes/reembed-all
   */
  @Post('reembed-all')
  @UseGuards(JwtAuthGuard)
  async reembedAll(@Req() req: Request) {
    // Optionally, check for admin role here
    // if ((req.user as any).role !== 'ADMIN') throw new ForbiddenException('Admins only');
    return this.resumeService.reembedAllResumes();
  }


  @Post('reembed/:id')
  @UseGuards(JwtAuthGuard)
  async reembedSingle(@Param('id') id: string) {
    return this.resumeService.reembedResumeById(Number(id));
  }

  @Post('reembed-missing')
  @UseGuards(JwtAuthGuard)
  async reembedMissing() {
    return this.resumeService.reembedMissingResumes();
  }



  @Get(':id/matches')
  @UseGuards(JwtAuthGuard)
  async getResumeMatches(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.resumeService.getResumeMatches(Number(id), user.id);
  }

  @Get(':id/chunk-ids')
  @UseGuards(JwtAuthGuard)
  async getResumeChunkIds(@Param('id') id: string) {
    return this.resumeService.printResumeChunkIds(Number(id));
  }

  @Get('verify-embeddings')
  @UseGuards(JwtAuthGuard)
  async verifyEmbeddings() {
    return this.resumeService.verifyAllEmbeddings();
  }

  @Post('force-reembed-all-with-logs')
  @UseGuards(JwtAuthGuard)
  async forceReembedAllWithLogs() {
    return this.resumeService.forceReembedAllResumesWithLogs();
  }
} 