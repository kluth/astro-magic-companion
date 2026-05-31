import { Observable, BehaviorSubject } from 'rxjs';
import { GameSession } from '../../core/domain/models';
import { Result, success, failure } from '../../core/domain/result.type';
import { SyncPort } from '../../core/application/ports/sync.port';
import { Injectable } from '@angular/core';

/**
 * Local-only implementation of SyncPort for development and offline testing.
 * Uses a simple BehaviorSubject to simulate a remote document.
 */
@Injectable()
export class LocalSyncAdapter implements SyncPort {
  private readonly sessions = new Map<string, BehaviorSubject<GameSession>>();

  async syncState(session: GameSession): Promise<Result<void, string>> {
    console.log('[LocalSync] Syncing state:', session.roomCode);
    const subject = this.sessions.get(session.roomCode);
    if (subject) {
      subject.next(session);
    } else {
      this.sessions.set(session.roomCode, new BehaviorSubject(session));
    }
    return success(undefined);
  }

  session$(roomCode: string): Observable<GameSession> {
    const subject = this.sessions.get(roomCode);
    if (!subject) {
      throw new Error(`Room ${roomCode} not found`);
    }
    return subject.asObservable();
  }

  async joinRoom(code: string): Promise<Result<GameSession, string>> {
    const subject = this.sessions.get(code);
    if (subject) {
      return success(subject.value);
    }
    return failure(`Room ${code} not found. Did the GM start it?`);
  }
}
