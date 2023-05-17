import { LogLevel } from '@nestjs/common';

export function parseLogLevelsConfig(): LogLevel[] {
  const allLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  const levels = (process.env.LOG_LEVELS ?? '')
    .split(',')
    .map(l => l.toLowerCase().trim())
    .filter(l => l !== '');
  if (levels.length === 0) return allLevels;
  const invalid = levels.filter(l => allLevels.indexOf(l as LogLevel) < 0);
  if (invalid.length > 0) {
    throw new Error(
      `invalid log levels: ${invalid.join(',')}, expecting: ${allLevels.join(
        ',',
      )}`,
    );
  }
  return levels as LogLevel[];
}

export enum WrapSteps {
  W0 = 0,
  W1 = 1,
  W2 = 2,
  W3 = 3,
  W4 = 4,
  W5 = 5,
  W6 = 6,
  W7 = 7,
  W8 = 8,
}

export function wrapMsg(s: WrapSteps, id: string, msg: string): string {
  return `[${s}][wrap-${id}] ${msg}`;
}
