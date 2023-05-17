import BufferKeyMap from './buffer-key-map';

describe('test buffer as map key', () => {
  it('happy path', () => {
    const m = new BufferKeyMap<string>();
    m.set(Buffer.from([1, 2, 3]), '123');
    expect(m.has(Buffer.from([1, 1, 1]))).toBe(false);
    expect(m.has(Buffer.from([1, 2, 3]))).toBe(true);
    expect(m.get(Buffer.from([1, 2, 3]))).toBe('123');
    expect(m.size).toBe(1);
    for (const [k, v] of m) {
      expect(k).toEqual(Buffer.from([1, 2, 3]));
      expect(v).toBe('123');
    }
    for (const k of m.keys()) {
      expect(k).toEqual(Buffer.from([1, 2, 3]));
    }
    for (const v of m.values()) {
      expect(v).toBe('123');
    }
    m.delete(Buffer.from([1, 2, 3]));
    expect(m.has(Buffer.from([1, 2, 3]))).toBe(false);
    expect(m.size).toBe(0);
  });
});
