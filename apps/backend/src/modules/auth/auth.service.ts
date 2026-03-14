import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ============================================
// MAINTENANCE MODE — Registration Control
// Only emails in this list can create accounts
// Empty list = nobody can register
// ============================================
const REGISTRATION_ENABLED = false;
const ALLOWED_REGISTRATION_EMAILS: string[] = [
  'eitapumba@gmail.com',
  // Add more allowed emails here
];

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Block registration if not enabled or email not in allowed list
    if (!REGISTRATION_ENABLED && !ALLOWED_REGISTRATION_EMAILS.includes(dto.email.toLowerCase())) {
      throw new ForbiddenException('Registros estão temporariamente desativados. Estamos em manutenção.');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateTokens(user);
  }

  async validateGoogleAuth(googleId: string, email: string, displayName: string): Promise<AuthTokens> {
    let user = await this.usersService.findByGoogleId(googleId);
    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        await this.usersService.update(user.id, { googleId });
      } else {
        // Block new Google registrations if not enabled
        if (!REGISTRATION_ENABLED && !ALLOWED_REGISTRATION_EMAILS.includes(email.toLowerCase())) {
          throw new ForbiddenException('Registros estão temporariamente desativados. Estamos em manutenção.');
        }
        user = await this.usersService.create({ email, displayName, googleId });
      }
    }
    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    await this.usersService.update(user.id, { refreshToken });

    return { accessToken, refreshToken };
  }
}
