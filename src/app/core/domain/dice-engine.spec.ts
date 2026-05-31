import { describe, it, expect } from 'vitest';
import { rollDice, validateAttributes } from './dice-engine';
import { Attributes } from './models';

describe('Dice Engine', () => {
  describe('validateAttributes', () => {
    it('should pass if total is exactly 6', () => {
      const attrs: Attributes = { muckis: 2, koepfchen: 2, herz: 2 };
      const result = validateAttributes(attrs);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(attrs);
      }
    });

    it('should fail if total is not 6', () => {
      const attrs: Attributes = { muckis: 4, koepfchen: 4, herz: 4 };
      const result = validateAttributes(attrs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('must be exactly 6');
      }
    });
  });

  describe('rollDice', () => {
    it('should return correct number of dice', () => {
      const result = rollDice(3);
      expect(result.dice.length).toBe(3);
    });

    it('should count successes correctly (5 and 6)', () => {
      // Mock random values: 1, 5, 6
      const mockRandom = () => {
        const values = [1, 5, 6];
        let i = 0;
        return () => values[i++];
      };
      
      const nextVal = mockRandom();
      const result = rollDice(3, () => nextVal());
      
      expect(result.successes).toBe(2);
      expect(result.isPatzer).toBe(false);
    });

    it('should identify Aether-Patzer (0 successes + at least one 1)', () => {
      // Mock random values: 1, 2, 4
      const mockRandom = () => {
        const values = [1, 2, 4];
        let i = 0;
        return () => values[i++];
      };
      
      const nextVal = mockRandom();
      const result = rollDice(3, () => nextVal());
      
      expect(result.successes).toBe(0);
      expect(result.isPatzer).toBe(true);
    });

    it('should not be a Patzer if there are successes even with a 1', () => {
      // Mock random values: 1, 5, 4
      const mockRandom = () => {
        const values = [1, 5, 4];
        let i = 0;
        return () => values[i++];
      };
      
      const nextVal = mockRandom();
      const result = rollDice(3, () => nextVal());
      
      expect(result.successes).toBe(1);
      expect(result.isPatzer).toBe(false);
    });

    it('should handle zero dice', () => {
      const result = rollDice(0);
      expect(result.dice).toEqual([]);
      expect(result.successes).toBe(0);
      expect(result.isPatzer).toBe(false);
    });
  });
});
