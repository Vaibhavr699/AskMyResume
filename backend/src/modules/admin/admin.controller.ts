import { Controller, Post, Body, UseGuards, BadRequestException, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate an admin invitation code (admin only)
   * POST /admin/invite
   * Body: { email?: string }
   * Returns: { code }
   */
  @Post('invite')
  @Roles('ADMIN')
  async generateAdminInvite(@Body('email') email?: string) {
    const code = crypto.randomBytes(32).toString('hex');
    await this.prisma.adminInvite.create({
      data: { code, email },
    });
    // In production, send this code securely to the intended admin
    return { code };
  }

  /**
   * GET /admin/resumes
   * Returns all resumes with their analysis (including score)
   */
  @Get('resumes')
  @Roles('ADMIN')
  async getAllResumes() {
    return await this.prisma.resume.findMany({
      include: { analysis: true, user: true },
    });
  }

  /**
   * GET /admin/analysis
   * Returns all ResumeAnalysis records
   */
  @Get('analysis')
  @Roles('ADMIN')
  async getAllAnalysis() {
    return await this.prisma.resumeAnalysis.findMany({
      include: { resume: true },
    });
  }
} 