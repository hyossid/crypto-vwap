import {
  makeSignFaucetMessage,
  verifyFaucetSignature,
} from '@root/commons/sign/sign';
import { ENV } from '@root/env';
import {
  getPublicKeyFromPrivate,
  verifyMessageSignature,
  verifyMessageSignatureRsv,
} from '@stacks/encryption';
import {
  createStacksPrivateKey,
  signMessageHashRsv,
  signWithKey,
} from '@stacks/transactions';
import { createHash } from 'crypto';

function toBuffer(input: string) {
  return Buffer.from(
    input.length >= 2 && input[1] === 'x' ? input.slice(2) : input,
    'hex',
  );
}

describe('sign', () => {
  const nonce = 'ABCDE';
  const message = makeSignFaucetMessage(ENV.USER_ACCOUNT_ADDRESS_0, nonce);

  const stacksPrivateKey = createStacksPrivateKey(
    toBuffer(ENV.USER_ACCOUNT_SENDER_KEY_0),
  );
  const publicKey = getPublicKeyFromPrivate(stacksPrivateKey.data);
  const hash = createHash('sha256').update(toBuffer(message)).digest();

  it('should sign vrs', function () {
    const signatureVrs = signWithKey(
      stacksPrivateKey,
      hash.toString('hex'),
    ).data;
    const verifyVrs = verifyMessageSignature({
      signature: signatureVrs,
      publicKey,
      message: hash,
    });
    expect(verifyVrs).toBeTruthy();
  });

  it('should sign rsv', function () {
    const signatureRsv = signMessageHashRsv({
      privateKey: stacksPrivateKey,
      messageHash: hash.toString('hex'),
    }).data;

    const verifyRsv = verifyMessageSignatureRsv({
      signature: signatureRsv,
      message: hash,
      publicKey,
    });

    expect(verifyRsv).toBeTruthy();
  });

  it('should sign faucet', function () {
    const signatureVrs = signWithKey(
      stacksPrivateKey,
      hash.toString('hex'),
    ).data;

    const valid = verifyFaucetSignature(signatureVrs, nonce, publicKey);
    expect(valid).toBeTruthy();
  });
});
