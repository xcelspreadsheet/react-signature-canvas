module.exports = {
  setupFilesAfterEnv: [
    // configure enzyme w/ react adapter
    '<rootDir>/test/config/configure-enzyme.js',
    // polyfill window.resizeTo
    '<rootDir>/test/config/window-resizeTo.js'
  ],
  transform: {
    // support babel-jest. TSDX defaults to just ts-jest. see https://github.com/jaredpalmer/tsdx/pull/486
    '\\.js$': 'babel-jest',
    '\\.tsx$': 'ts-jest'
  },
  // support JS + JSX. TSDX defaults to just TS + TSX. see https://github.com/jaredpalmer/tsdx/pull/486
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: [
    '/node_modules/', // default
    '<rootDir>/test/' // ignore any test helper files
  ]
}
