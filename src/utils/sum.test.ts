import { sum } from './sum';

describe('sum function', () => {
  it('should return the correct sum of two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});