// jest.config.js

const config = {
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@pages/(.*)$': '<rootDir>/pages/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!pages/_*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov'],
  //setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

};
export default config;
