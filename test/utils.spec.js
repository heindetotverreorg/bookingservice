import { describe, it, expect } from "vitest"
import { parseTimeAndAdd } from '/server/utils/index.js'

describe('parseTimeAndAdd: server/utils/index.js', () => {
  it('should add increments of 30 minutes to formatted time string', () => {
    const time = '12:30'
    expect(parseTimeAndAdd(time)).toBe('13:00');
  });
});