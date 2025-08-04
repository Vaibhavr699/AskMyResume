import { Controller, Get, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserResponseDto } from './user.dto';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Admin only: List all users
   * GET /users
   */
  @Get()
  @Roles('ADMIN')
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  /**
   * Admin or self: Get user profile
   * GET /users/:id
   */
  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: Request): Promise<UserResponseDto> {
    const user = req.user as any;
    if (user.role !== 'ADMIN' && user.userId !== Number(id)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
    return this.userService.getUserById(Number(id));
  }

  /**
   * Get stats for the current user
   * GET /users/stats
   */
  @Get('stats')
  async getStats(@Req() req: Request) {
    if (!req.user) {
      throw new ForbiddenException('User not authenticated');
    }
    const id = (req.user as any).userId ?? (req.user as any).id;
    if (!id) {
      throw new ForbiddenException('User ID not found in token');
    }
    return this.userService.getUserStats({ id });
  }
}