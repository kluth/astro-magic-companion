import { Injectable, inject, effect } from '@angular/core';
import { SessionStore } from '../state/session.store';
import { SyncPort } from '../ports/sync.port';
import { Character, GameSession } from '../../domain/models';
import { Result, success, failure } from '../../domain/result.type';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly store = inject(SessionStore);
  // Note: We'll inject the real adapter once implemented. 
  // For now, we define a dummy or use a token.
  private readonly syncPort = inject('SyncPort' as any, { optional: true }) as unknown as SyncPort;

  constructor() {
    // Reactive sync effect: When local state changes, push to remote if we are connected
    effect(() => {
      const session = this.store.session();
      if (session && this.syncPort) {
        this.syncPort.syncState(session);
      }
    });
  }

  async createSession(gmName: string): Promise<Result<string, string>> {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const gmId = crypto.randomUUID();
    
    const initialSession: GameSession = {
      roomCode,
      gmId,
      players: {},
      shipConsole: {
        redButtonUsed: false,
        astroKitchenState: 'ready'
      }
    };

    this.store.setSession(initialSession);
    this.store.setLocalPlayer(gmId);
    
    if (this.syncPort) {
      await this.syncPort.syncState(initialSession);
      this.subscribeToUpdates(roomCode);
    }

    return success(roomCode);
  }

  async joinSession(roomCode: string, playerName: string): Promise<Result<void, string>> {
    this.store.setLoading(true);
    
    // In a real app, we'd fetch the session from syncPort first
    if (!this.syncPort) {
      this.store.setError('Sync service not available');
      return failure('Sync service not available');
    }

    const joinResult = await this.syncPort.joinRoom(roomCode);
    if (!joinResult.success) {
      this.store.setError(joinResult.error);
      return joinResult;
    }

    const session = joinResult.value;
    const playerId = crypto.randomUUID();
    const newPlayer: Character = {
      id: playerId,
      name: playerName,
      attributes: { muckis: 2, koepfchen: 2, herz: 2 },
      starCrystals: 3,
      trashOMeter: 0,
      backpack: []
    };

    const updatedSession: GameSession = {
      ...session,
      players: { ...session.players, [playerId]: newPlayer }
    };

    this.store.setSession(updatedSession);
    this.store.setLocalPlayer(playerId);
    await this.syncPort.syncState(updatedSession);
    this.subscribeToUpdates(roomCode);

    this.store.setLoading(false);
    return success(undefined);
  }

  private subscribeToUpdates(roomCode: string) {
    if (this.syncPort) {
      this.syncPort.session$(roomCode).subscribe(session => {
        // Only update if it's different to avoid loops (though SignalStore handles this)
        this.store.setSession(session);
      });
    }
  }
}
