import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

// DTOs
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class AdminInviteAcceptDto {
  @IsString()
  code: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signup(@Body() signupDto: SignupDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: signupDto.email },
      });
      
      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }

      const user = await this.authService.register(
        signupDto.email,
        signupDto.password,
        signupDto.name,
      );

      return { 
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user.userId;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Post('admin-invite')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async acceptAdminInvite(@Body() dto: AdminInviteAcceptDto) {
    const invite = await this.prisma.adminInvite.findUnique({
      where: { code: dto.code },
    });
    if (
      !invite ||
      invite.used ||
      (invite.email && invite.email !== dto.email)
    ) {
      throw new BadRequestException('Invalid or expired invitation code');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    await this.prisma.adminInvite.update({
      where: { code: dto.code },
      data: { used: true, usedAt: new Date() },
    });

    return { message: 'Admin account created successfully' };
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'If your email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `AskMyResume <${process.env.GMAIL_USER}>`,
      to: dto.email,
      subject: '🔐 Reset Your Password - AskMyResume',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a;">AskMyResume</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Hi there,</p>
          <p style="font-size: 16px; color: #333;">
            We received a request to reset the password for your <strong>AskMyResume</strong> account.
          </p>
          <p style="font-size: 16px; color: #333;">Click the button below to reset it. This link will expire in <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            If you didn’t request this, you can safely ignore this email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} AskMyResume. All rights reserved.<br />
            Contact us at <a href="mailto:support@askmyresume.com" style="color: #2563eb;">support@askmyresume.com</a>
          </p>
        </div>
      `,
    });

    return { message: 'If your email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const reset = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: reset.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    return { message: 'Password has been reset successfully.' };
  }
}
