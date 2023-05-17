import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModule } from '@nestjs/testing';

const devLogger = () => ({
  verbose: console.log,
  debug: console.log,
  log: console.log,
  error: console.error,
  warn: console.warn,
});
const ciLogger = () => {
  return {
    verbose() {
      return;
    },
    debug() {
      return;
    },
    log() {
      return;
    },
    error: console.error,
    warn: console.warn,
  };
};
export async function createTestingModule(metadata: ModuleMetadata) {
  const app: TestingModule = await Test.createTestingModule(metadata)
    .setLogger(process.env.IS_CI == null ? devLogger() : ciLogger())
    .compile();
  await app.init();
  return app;
}
