import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, ConnectedSocket, MessageBody,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:19006', 'capacitor://localhost', 'tauri://localhost'],
  },
  namespace: '/challenges',
})
export class ChallengesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChallengesGateway.name);
  private userSockets = new Map<string, string[]>(); // userId → socketIds

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      const existing = this.userSockets.get(userId) || [];
      existing.push(client.id);
      this.userSockets.set(userId, existing);
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected (socket: ${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId)?.filter(id => id !== client.id) || [];
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, sockets);
      }
      this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
    }
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Emit when a challenge is matched (both players)
  emitChallengeMatched(challengeId: string, participants: { userId: string; displayName: string; stats: any }[]) {
    for (const p of participants) {
      const opponent = participants.find(op => op.userId !== p.userId);
      this.emitToUser(p.userId, 'challenge.matched', {
        challengeId,
        opponent: {
          id: opponent?.userId,
          displayName: opponent?.displayName,
          stats: opponent?.stats,
        },
        matchedAt: new Date().toISOString(),
      });
    }
  }

  // Emit when challenge starts
  emitChallengeStarted(challengeId: string, participantIds: string[]) {
    for (const userId of participantIds) {
      this.emitToUser(userId, 'challenge.started', {
        challengeId,
        startedAt: new Date().toISOString(),
      });
    }
  }

  // Emit when challenge is completed
  emitChallengeCompleted(challengeId: string, winnerId: string, participantIds: string[], payoutInfo: any) {
    for (const userId of participantIds) {
      this.emitToUser(userId, 'challenge.completed', {
        challengeId,
        winnerId,
        isWinner: userId === winnerId,
        payout: payoutInfo,
        completedAt: new Date().toISOString(),
      });
    }
  }

  // Emit live viewer count updates
  emitViewerUpdate(challengeId: string, viewerCount: number) {
    this.server.emit('challenge.viewers', { challengeId, viewerCount });
  }

  // Subscribe to a challenge (for viewers)
  @SubscribeMessage('challenge.watch')
  handleWatch(@ConnectedSocket() client: Socket, @MessageBody() data: { challengeId: string }) {
    client.join(`challenge:${data.challengeId}`);
    this.logger.log(`Socket ${client.id} watching challenge ${data.challengeId}`);
  }
}
