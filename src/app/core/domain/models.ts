/**
 * Ubiquitous language and domain entities for Astro-Magic.
 */

export type AttributeValue = 1 | 2 | 3 | 4;

export interface Attributes {
  readonly muckis: AttributeValue;    // Brawn
  readonly koepfchen: AttributeValue; // Brains
  readonly herz: AttributeValue;      // Heart
}

export interface Character {
  readonly id: string;
  readonly name: string;
  readonly attributes: Attributes;
  readonly starCrystals: number;      // Current pool (3-5)
  readonly trashOMeter: number;       // 0-3
  readonly backpack: readonly string[];
}

export interface ShipConsole {
  readonly redButtonUsed: boolean;
  readonly astroKitchenState: 'ready' | 'cooldown';
}

export interface RollResult {
  readonly dice: readonly number[];   // Raw W6 values
  readonly successes: number;         // Count of 5s and 6s
  readonly isPatzer: boolean;         // 0 successes AND at least one 1
}

export interface GameSession {
  readonly roomCode: string;          // 4-char ID
  readonly gmId: string;
  readonly players: Record<string, Character>;
  readonly shipConsole: ShipConsole;
  readonly activeEncounter?: {
    readonly dangerLevel: number;
    readonly description: string;
  };
}
