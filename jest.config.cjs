module.exports = {
  moduleNameMapper: {
    '@root/(.*)': ['<rootDir>/packages/$1'],
  },
  modulePathIgnorePatterns: ['/node_modules/', '/dist/'],
  preset: 'ts-jest',
  testEnvironment: './packages/testing/emulator-test-env.js',
  setupFilesAfterEnv: [],
  testTimeout: 180000,
  transform: {},
  transformIgnorePatterns: ['\\.js$', '\\.jsx$', '\\.json$'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'd.ts'],
  detectOpenHandles: true,
  forceExit: true,
};
