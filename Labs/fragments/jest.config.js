// Local Jest config for fragments microservice
// Removes Babel transforms; uses Node's native CommonJS
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/Unit/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: false,
};
