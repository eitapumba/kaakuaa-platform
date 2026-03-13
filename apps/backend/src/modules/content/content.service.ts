import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './content.entity';
import { ContentType } from '../../common/types';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
  ) {}

  async create(data: Partial<Content>): Promise<Content> {
    const content = this.contentRepo.create(data);
    return this.contentRepo.save(content);
  }

  async findById(id: string): Promise<Content> {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!content) throw new NotFoundException('Conteúdo não encontrado');
    return content;
  }

  async listFeed(type?: ContentType, page = 1, limit = 20) {
    const where: any = { isPublished: true };
    if (type) where.type = type;

    return this.contentRepo.findAndCount({
      where,
      relations: ['creator'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getFeatured(limit = 10) {
    return this.contentRepo.find({
      where: { isPublished: true, isFeatured: true },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async incrementView(id: string) {
    await this.contentRepo.increment({ id }, 'viewCount', 1);
  }

  async incrementLike(id: string) {
    await this.contentRepo.increment({ id }, 'likeCount', 1);
  }

  async getUserContent(creatorId: string, page = 1, limit = 20) {
    return this.contentRepo.findAndCount({
      where: { creatorId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getChallengeContent(challengeId: string) {
    return this.contentRepo.find({
      where: { challengeId, isPublished: true },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }
}
