import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map(user => new UserResponseDto(user));
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }

  async getUserStats(user: { id: number } | { userId: number }) {
    const userId = 'userId' in user ? user.userId : user.id;
    const resumes = await this.prisma.resume.findMany({
      where: { userId },
      include: { analysis: true },
    });
    const totalResumes = resumes.length;
    const scores = resumes.map(r => r.analysis?.score ?? 0);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      resumes: totalResumes,
      overallScore: Math.round(avgScore),
    };
  }
} 