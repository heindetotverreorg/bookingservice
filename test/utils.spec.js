import { describe, it, expect } from "vitest"
import { parseTimeAndAdd } from '/server/utils/index.js'

describe('parseTimeAndAdd: server/utils/index.js', () => {
  it('should return datetime reflecting cron expression', () => {
    const time = '12:30'
    expect(parseTimeAndAdd(time)).toBe('13:00');
  });
});