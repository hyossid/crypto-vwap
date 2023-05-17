import { ENHANCED_ENV } from '@root/env';
import { verifyMessageSignature } from '@stacks/encryption';
import { getAddressFromPublicKey } from '@stacks/transactions';
import { createHash } from 'crypto';
import debug from 'debug';

const log = debug('bridge:sign');

function toBuffer(input: string) {
  return Buffer.from(
    input.length >= 2 && input[1] === 'x' ? input.slice(2) : input,
    'hex',
  );
}

export const makeSignFaucetMessage = (address: string, nonce: string) =>
  `Sign in to Alex as ${address} nonce ${nonce}`;

export const verifyFaucetSignature = (
  signature: string,
  nonce: string,
  publicKey: string,
): boolean => {
  const stxAddress = getAddressFromPublicKey(
    publicKey,
    ENHANCED_ENV.STACKS_TRANSACTION_VERSION,
  );

  const message = makeSignFaucetMessage(stxAddress, nonce);
  const hash = createHash('sha256').update(toBuffer(message)).digest();
  const isValid = verifyMessageSignature({
    message: hash,
    publicKey,
    signature,
  });

  log(
    `sign: ${stxAddress}, Signature is ${
      isValid ? 'valid' : 'invalid'
    }, nonce: ${nonce}, signature: ${signature}\n message: ${message}`,
  );

  return isValid;
};
