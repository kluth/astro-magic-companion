import { Attributes, RollResult } from './models';
import { failure, Result, success } from './result.type';

/**
 * Validates if the attribute distribution follows the rule:
 * Exactly 6 points total, each between 1 and 4.
 */
export const validateAttributes = (attrs: Attributes): Result<Attributes, string> => {
  const total = attrs.muckis + attrs.koepfchen + attrs.herz;
  
  if (total !== 6) {
    return failure(`Attribute total must be exactly 6 (current: ${total})`);
  }
  
  return success(attrs);
};

/**
 * Rolls a pool of W6 dice and evaluates successes.
 * Success = 5 or 6.
 * Patzer = 0 successes AND at least one 1.
 */
export const rollDice = (count: number, randomFn = () => Math.floor(Math.random() * 6) + 1): RollResult => {
  if (count <= 0) {
    return { dice: [], successes: 0, isPatzer: false };
  }

  const dice = Array.from({ length: count }, () => randomFn());
  const successes = dice.filter(d => d >= 5).length;
  const hasOne = dice.includes(1);
  const isPatzer = successes === 0 && hasOne;

  return {
    dice,
    successes,
    isPatzer
  };
};
