/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
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
    '!pages/_*.{ts,tsx}',       // Ignore _app.tsx, _document.tsx
    // '!pages/api/**',            // Ignore API routes
    '!**/*.test.{ts,tsx}',      // Ignore test files
  ],
  coverageReporters: ['text', 'lcov'],
};
