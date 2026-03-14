import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, ConnectedSocket, MessageBody,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:19006', 'capacitor://localhost', 'tauri://localhost', 'https://junglegames.ai', 'https://www.junglegames.ai'],
  },
  namespace: '/challenges',
})
export class ChallengesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChallengesGateway.name);
  private userSockets = new Map<string, string[]>(); // userId → socketIds

  // Challenge rooms: challengeId → { participants, viewers, votes }
  private challengeRooms = new Map<string, {
    participants: string[];
    viewers: Set<string>;
    votes: Map<string, string>; // viewerSocketId → votedForUserId
  }>();

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

  // ═══════════════════════════════════
  // EMIT HELPERS
  // ═══════════════════════════════════

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitChallengeMatched(challengeId: string, participants: { userId: string; displayName: string; stats: any }[]) {
    // Create a room for this challenge
    this.challengeRooms.set(challengeId, {
      participants: participants.map(p => p.userId),
      viewers: new Set(),
      votes: new Map(),
    });

    for (const p of participants) {
      const opponent = participants.find(op => op.userId !== p.userId);
      // Join challenge room
      const sockets = this.userSockets.get(p.userId) || [];
      sockets.forEach(sid => {
        const s = this.server.sockets.sockets.get(sid);
        if (s) s.join(`challenge:${challengeId}`);
      });

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

  emitChallengeStarted(challengeId: string, participantIds: string[]) {
    for (const userId of participantIds) {
      this.emitToUser(userId, 'challenge.started', {
        challengeId,
        startedAt: new Date().toISOString(),
      });
    }
  }

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
    // Clean up room
    this.challengeRooms.delete(challengeId);
  }

  emitViewerUpdate(challengeId: string, viewerCount: number) {
    this.server.to(`challenge:${challengeId}`).emit('challenge.viewers', { challengeId, viewerCount });
  }

  // ═══════════════════════════════════
  // WEBRTC SIGNALING
  // Relay SDP offers/answers and ICE candidates between peers
  // ═══════════════════════════════════

  @SubscribeMessage('webrtc.offer')
  handleWebRTCOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string; targetUserId: string; sdp: any },
  ) {
    const userId = client.handshake.auth?.userId;
    this.logger.log(`[WebRTC] Offer from ${userId} to ${data.targetUserId} for challenge ${data.challengeId}`);
    this.emitToUser(data.targetUserId, 'webrtc.offer', {
      challengeId: data.challengeId,
      fromUserId: userId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('webrtc.answer')
  handleWebRTCAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string; targetUserId: string; sdp: any },
  ) {
    const userId = client.handshake.auth?.userId;
    this.logger.log(`[WebRTC] Answer from ${userId} to ${data.targetUserId}`);
    this.emitToUser(data.targetUserId, 'webrtc.answer', {
      challengeId: data.challengeId,
      fromUserId: userId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('webrtc.ice-candidate')
  handleICECandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string; targetUserId: string; candidate: any },
  ) {
    this.emitToUser(data.targetUserId, 'webrtc.ice-candidate', {
      challengeId: data.challengeId,
      fromUserId: client.handshake.auth?.userId,
      candidate: data.candidate,
    });
  }

  // Ready signal — when a player's camera/mic is ready, notify the other
  @SubscribeMessage('webrtc.ready')
  handleWebRTCReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string },
  ) {
    const userId = client.handshake.auth?.userId;
    const room = this.challengeRooms.get(data.challengeId);
    if (room) {
      const otherParticipants = room.participants.filter(p => p !== userId);
      for (const pid of otherParticipants) {
        this.emitToUser(pid, 'webrtc.peer-ready', {
          challengeId: data.challengeId,
          userId,
        });
      }
    }
  }

  // ═══════════════════════════════════
  // VIEWER VOTING
  // ═══════════════════════════════════

  @SubscribeMessage('challenge.watch')
  handleWatch(@ConnectedSocket() client: Socket, @MessageBody() data: { challengeId: string }) {
    client.join(`challenge:${data.challengeId}`);
    const room = this.challengeRooms.get(data.challengeId);
    if (room) {
      room.viewers.add(client.id);
      this.emitViewerUpdate(data.challengeId, room.viewers.size);
    }
    this.logger.log(`Socket ${client.id} watching challenge ${data.challengeId}`);
  }

  @SubscribeMessage('challenge.vote')
  handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string; votedForUserId: string },
  ) {
    const room = this.challengeRooms.get(data.challengeId);
    if (!room) return;

    // One vote per viewer
    room.votes.set(client.id, data.votedForUserId);

    // Tally votes
    const tally: Record<string, number> = {};
    for (const [, votedFor] of room.votes) {
      tally[votedFor] = (tally[votedFor] || 0) + 1;
    }

    // Broadcast updated tally to everyone in the challenge room
    this.server.to(`challenge:${data.challengeId}`).emit('challenge.vote-update', {
      challengeId: data.challengeId,
      votes: tally,
      totalVotes: room.votes.size,
    });
  }

  // Get vote results for a challenge
  getVoteResults(challengeId: string): { votes: Record<string, number>; totalVotes: number } {
    const room = this.challengeRooms.get(challengeId);
    if (!room) return { votes: {}, totalVotes: 0 };

    const tally: Record<string, number> = {};
    for (const [, votedFor] of room.votes) {
      tally[votedFor] = (tally[votedFor] || 0) + 1;
    }
    return { votes: tally, totalVotes: room.votes.size };
  }

  // ═══════════════════════════════════
  // AI JUDGING REQUEST
  // Player submits frame/evidence for AI analysis
  // ═══════════════════════════════════

  @SubscribeMessage('challenge.submit-frame')
  handleSubmitFrame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string; frameData: string; metadata?: any },
  ) {
    const userId = client.handshake.auth?.userId;
    // Broadcast to challenge room that evidence was submitted
    this.server.to(`challenge:${data.challengeId}`).emit('challenge.evidence-submitted', {
      challengeId: data.challengeId,
      userId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`[AI] Frame submitted by ${userId} for challenge ${data.challengeId}`);
  }

  @SubscribeMessage('challenge.request-judgment')
  handleRequestJudgment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string },
  ) {
    const userId = client.handshake.auth?.userId;
    this.logger.log(`[AI] Judgment requested by ${userId} for challenge ${data.challengeId}`);

    // Notify all participants that judging has started
    this.server.to(`challenge:${data.challengeId}`).emit('challenge.judging-started', {
      challengeId: data.challengeId,
      requestedBy: userId,
      startedAt: new Date().toISOString(),
    });
  }
}
