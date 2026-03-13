import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification } from './verification.entity';
import { VerificationMethod, VerificationStatus } from '../../common/types';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
  ) {}

  async create(data: {
    challengeId: string;
    userId: string;
    method: VerificationMethod;
    evidenceUrl: string;
    evidenceData?: any;
  }): Promise<Verification> {
    const verification = this.verificationRepo.create({
      ...data,
      status: VerificationStatus.PENDING,
    });
    return this.verificationRepo.save(verification);
  }

  async processVerification(verificationId: string): Promise<Verification> {
    const verification = await this.verificationRepo.findOneOrFail({
      where: { id: verificationId },
    });

    verification.status = VerificationStatus.ANALYZING;
    await this.verificationRepo.save(verification);

    // AI Analysis pipeline
    const aiResult = await this.runAiAnalysis(verification);
    verification.aiScore = aiResult.score;
    verification.aiAnalysis = aiResult;

    // Route based on score
    if (aiResult.score >= 85) {
      verification.status = VerificationStatus.APPROVED;
      verification.finalScore = aiResult.score;
    } else if (aiResult.score >= 60) {
      verification.status = VerificationStatus.MANUAL_REVIEW;
    } else {
      verification.status = VerificationStatus.REJECTED;
      verification.finalScore = aiResult.score;
    }

    this.logger.log(
      `Verification ${verificationId}: score=${aiResult.score} status=${verification.status}`,
    );

    return this.verificationRepo.save(verification);
  }

  async manualReview(verificationId: string, reviewerId: string, approved: boolean, notes?: string) {
    const verification = await this.verificationRepo.findOneOrFail({
      where: { id: verificationId },
    });

    verification.reviewerId = reviewerId;
    verification.reviewNotes = notes || '';
    verification.reviewedAt = new Date();
    verification.status = approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
    verification.finalScore = approved ? Math.max(Number(verification.aiScore), 85) : Number(verification.aiScore);

    return this.verificationRepo.save(verification);
  }

  async appeal(verificationId: string, reason: string) {
    const verification = await this.verificationRepo.findOneOrFail({
      where: { id: verificationId },
    });

    verification.status = VerificationStatus.APPEALED;
    verification.appealReason = reason;
    verification.appealedAt = new Date();

    return this.verificationRepo.save(verification);
  }

  async getChallengeVerifications(challengeId: string) {
    return this.verificationRepo.find({
      where: { challengeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // TODO: Implement real AI analysis pipeline
  private async runAiAnalysis(verification: Verification) {
    // Placeholder — will integrate with AI models
    // Different methods need different analysis:
    // - PHOTO_GPS: image analysis + GPS validation + timestamp check
    // - SCREEN_CAPTURE: OCR + game state recognition
    // - SCREEN_RECORDING: video frame analysis + OCR
    // - LIVE_STREAM: real-time frame analysis
    // - WEARABLE: data anomaly detection
    // - SATELLITE: NDVI analysis
    return {
      score: 75, // Placeholder
      confidence: 0.8,
      findings: ['Análise pendente de implementação AI'],
      flags: [],
      modelUsed: 'placeholder',
      processingTime: 0,
    };
  }
}
