// jest-preset.js

module.exports = {
    preset: 'next/jest',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
  };
  