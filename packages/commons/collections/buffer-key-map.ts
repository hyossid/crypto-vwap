/**
 * https://github.com/nodejs/node/issues/19736
 */
export default class BufferKeyMap<T> implements Map<Buffer, T> {
  private readonly wrapped: Map<Buffer, T>;
  private readonly keyByHex: Map<string, Buffer>;
  private normalizedKeys: WeakMap<Buffer, Buffer>;
  constructor(entries?: readonly (readonly [Buffer, T])[] | null) {
    this.wrapped = new Map<Buffer, T>();
    this.keyByHex = new Map<string, Buffer>();
    this.normalizedKeys = new WeakMap<Buffer, Buffer>();
    if (Array.isArray(entries)) {
      for (const [key, value] of entries) {
        this.wrapped.set(key, value);
        this.keyByHex.set(key.toString('hex'), key);
        this.normalizedKeys.set(key, key);
      }
    }
  }
  private normalizeKey(key: Buffer, save = false): Buffer {
    let normalizedKey = this.normalizedKeys.get(key);
    if (normalizedKey != null) return normalizedKey;
    const hex = key.toString('hex');
    normalizedKey = this.keyByHex.get(hex);
    if (normalizedKey != null) {
      this.normalizedKeys.set(key, normalizedKey);
      return normalizedKey;
    }
    if (save) {
      this.keyByHex.set(hex, key);
      this.normalizedKeys.set(key, key);
    }
    return key;
  }
  clear(): void {
    this.wrapped.clear();
    this.keyByHex.clear();
    this.normalizedKeys = new WeakMap<Buffer, Buffer>();
  }
  delete(key: Buffer): boolean {
    // TODO: clean up key cache?
    const normalizedKey = this.normalizeKey(key);
    return this.wrapped.delete(normalizedKey);
  }
  forEach(
    callbackfn: (value: T, key: Buffer, map: Map<Buffer, T>) => void,
    thisArg?: any,
  ): void {
    return this.wrapped.forEach(callbackfn, thisArg);
  }
  get(key: Buffer): T | undefined {
    const normalizedKey = this.normalizeKey(key);
    return this.wrapped.get(normalizedKey);
  }
  has(key: Buffer): boolean {
    const normalizedKey = this.normalizeKey(key);
    return this.wrapped.has(normalizedKey);
  }
  set(key: Buffer, value: T): this {
    const normalizedKey = this.normalizeKey(key, true);
    this.wrapped.set(normalizedKey, value);
    return this;
  }
  get size(): number {
    return this.wrapped.size;
  }
  entries(): IterableIterator<[Buffer, T]> {
    return this.wrapped.entries();
  }
  keys(): IterableIterator<Buffer> {
    return this.wrapped.keys();
  }
  values(): IterableIterator<T> {
    return this.wrapped.values();
  }
  [Symbol.iterator](): IterableIterator<[Buffer, T]> {
    return this.wrapped[Symbol.iterator]();
  }
  get [Symbol.toStringTag](): string {
    return this.wrapped[Symbol.toStringTag];
  }
}
