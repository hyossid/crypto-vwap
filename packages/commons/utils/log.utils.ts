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
      `[Log Config] invalid log levels: ${invalid.join(
        ',',
      )}, expecting: ${allLevels.join(',')}`,
    );
  }
  return levels as LogLevel[];
}
