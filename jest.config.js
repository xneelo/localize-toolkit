module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  coverageDirectory: './coverage/',

  testMatch: [
    // Match anything within __tests__ folders.
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    // Match any typescript or javascript file ending with spec or test.
    '**/?(*.)(spec|test).(ts|tsx|js|jsx)',
  ],

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
