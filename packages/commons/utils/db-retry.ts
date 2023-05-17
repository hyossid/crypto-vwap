import { Logger } from '@nestjs/common';
import pRetry from 'p-retry';

export function dbRetry<T>(
  input: (attemptCount: number) => PromiseLike<T> | T,
  options: { logger: Logger },
): Promise<T> {
  return pRetry(input, {
    retries: 10,
    minTimeout: 250,
    maxTimeout: 250,
    onFailedAttempt: error => {
      options.logger.warn(
        `retrying: ${error.attemptNumber}/${
          error.retriesLeft + error.attemptNumber
        } - ${error}`,
      );
    },
  });
}
