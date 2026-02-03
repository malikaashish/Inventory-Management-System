module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).(js|jsx)',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx)',
  ],
};