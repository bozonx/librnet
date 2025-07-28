import { describe, it, expect } from '@jest/globals';
import { add, multiply, divide, subtract, power } from './utils/math';

describe('Coverage Demo', () => {
  describe('add function', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    it('should add zero', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('multiply function', () => {
    it('should multiply two numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('should handle zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });

  describe('divide function', () => {
    it('should divide two numbers', () => {
      expect(divide(6, 2)).toBe(3);
    });

    it('should throw error on division by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero');
    });
  });

  describe('subtract function', () => {
    it('should subtract two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should handle negative result', () => {
      expect(subtract(2, 5)).toBe(-3);
    });
  });

  describe('power function', () => {
    it('should calculate positive power', () => {
      expect(power(2, 3)).toBe(8);
    });

    it('should return 1 for zero exponent', () => {
      expect(power(5, 0)).toBe(1);
    });

    it('should calculate negative power', () => {
      expect(power(2, -2)).toBe(0.25);
    });
  });
});
