export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-quill-new|lodash-es)/)'
  ]
}