import { BytesLike } from 'ethers';

export class Nothing {
  // This lets us do `Exclude<T, Nothing>`
  // @ts-ignore
  private _!: unique symbol;
}
export type ValidRecipeReturnType<State> =
  | State
  | void
  | undefined
  | (State extends undefined ? Nothing : never);

export const bytesLikeToBuffer = (b: BytesLike): Buffer => {
  if (typeof b === 'string') {
    return Buffer.from(b, 'hex');
  }
  const a = [];
  for (let i = 0; i < b.length; i++) {
    a.push(b[i]);
  }
  return new Buffer(a);
};

export function filterNotEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export function toPrefix0xString(tx: string) {
  if (tx.startsWith('0x')) {
    return tx;
  }
  return `0x${tx}`;
}
