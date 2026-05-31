import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { GameSession, Character, RollResult } from '../../domain/models';
import { rollDice } from '../../domain/dice-engine';

export interface SessionState {
  session: GameSession | null;
  localPlayerId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  session: null,
  localPlayerId: null,
  isLoading: false,
  error: null,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ session, localPlayerId }) => ({
    allPlayers: computed(() => {
      const s = session();
      return s ? Object.values(s.players) : [];
    }),
    localPlayer: computed(() => {
      const s = session();
      const pid = localPlayerId();
      return (s && pid) ? s.players[pid] : null;
    }),
    isGM: computed(() => {
      const s = session();
      const pid = localPlayerId();
      return (s && pid) ? s.gmId === pid : false;
    }),
    roomCode: computed(() => session()?.roomCode ?? null),
  })),
  withMethods((store) => ({
    setSession(session: GameSession) {
      patchState(store, { session, error: null });
    },
    setLocalPlayer(id: string) {
      patchState(store, { localPlayerId: id });
    },
    setError(error: string) {
      patchState(store, { error, isLoading: false });
    },
    setLoading(isLoading: boolean) {
      patchState(store, { isLoading });
    },
    /**
     * Updates a character's state locally.
     * The actual sync will be handled by an effect or service listening to state changes.
     */
    updateCharacter(characterId: string, patch: Partial<Character>) {
      const current = store.session();
      if (!current || !current.players[characterId]) return;

      const updatedPlayers = {
        ...current.players,
        [characterId]: { ...current.players[characterId], ...patch },
      };

      patchState(store, {
        session: { ...current, players: updatedPlayers },
      });
    },
    /**
     * Executes a dice roll for a player and updates their state.
     */
    rollForPlayer(characterId: string, attribute: 'muckis' | 'koepfchen' | 'herz'): RollResult | null {
      const current = store.session();
      if (!current || !current.players[characterId]) return null;

      const player = current.players[characterId];
      const count = player.attributes[attribute];
      const result = rollDice(count);

      // We don't automatically update state here because rolls might just be displayed,
      // but we could track "lastRoll" in the character state if needed.
      return result;
    },
    toggleRedButton() {
      const current = store.session();
      if (!current) return;

      patchState(store, {
        session: {
          ...current,
          shipConsole: {
            ...current.shipConsole,
            redButtonUsed: !current.shipConsole.redButtonUsed,
          },
        },
      });
    },
    setEncounter(dangerLevel: number, description: string) {
      const current = store.session();
      if (!current) return;

      patchState(store, {
        session: {
          ...current,
          activeEncounter: { dangerLevel, description }
        }
      });
    },
    clearEncounter() {
      const current = store.session();
      if (!current) return;

      const { activeEncounter, ...rest } = current;
      patchState(store, { session: rest as GameSession });
    },
    restInKitchen() {
      const current = store.session();
      if (!current) return;

      // Refill all players' crystals to 5 (or their max)
      const updatedPlayers = { ...current.players };
      for (const id in updatedPlayers) {
        updatedPlayers[id] = { ...updatedPlayers[id], starCrystals: 5 };
      }

      patchState(store, {
        session: {
          ...current,
          players: updatedPlayers,
          shipConsole: { ...current.shipConsole, astroKitchenState: 'cooldown' }
        }
      });

      // Reset kitchen after a delay (simulated cooldown)
      setTimeout(() => {
        const latest = store.session();
        if (latest) {
          patchState(store, {
            session: {
              ...latest,
              shipConsole: { ...latest.shipConsole, astroKitchenState: 'ready' }
            }
          });
        }
      }, 30000);
    }
  }))
);
