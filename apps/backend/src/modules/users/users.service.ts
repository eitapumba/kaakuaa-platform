import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepo.update(id, data);
    return this.findByIdOrFail(id);
  }

  async getProfile(id: string) {
    const user = await this.findByIdOrFail(id);
    const { passwordHash, refreshToken, ...profile } = user;
    return profile;
  }

  async getLeaderboard(limit = 50) {
    return this.userRepo.find({
      select: ['id', 'displayName', 'avatarUrl', 'rank', 'challengesWon', 'totalEarnings', 'currentStreak'],
      where: { isActive: true },
      order: { totalEarnings: 'DESC' },
      take: limit,
    });
  }

  async updateVitaBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.vitaBalance = Number(user.vitaBalance) + amount;
    if (amount > 0) {
      user.vitaLifetimeEarned = Number(user.vitaLifetimeEarned) + amount;
    }
    user.vitaLastActivity = new Date();
    return this.userRepo.save(user);
  }

  async incrementStats(userId: string, field: 'challengesCompleted' | 'challengesWon', amount = 1) {
    await this.userRepo.increment({ id: userId }, field, amount);
  }
}
