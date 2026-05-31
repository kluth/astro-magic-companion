import { Observable } from 'rxjs';
import { GameSession } from '../../domain/models';
import { Result } from '../../domain/result.type';

/**
 * Port for real-time synchronization.
 * Decouples the application state from the infrastructure (Supabase/Firebase).
 */
export interface SyncPort {
  /**
   * Pushes the current session state to the remote store.
   */
  syncState(session: GameSession): Promise<Result<void, string>>;

  /**
   * Observable stream of session updates from the remote store.
   */
  session$(roomCode: string): Observable<GameSession>;

  /**
   * Joins an existing room or creates a new one.
   */
  joinRoom(code: string): Promise<Result<GameSession, string>>;
}
