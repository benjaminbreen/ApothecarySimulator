/**
 * Babel Configuration for Jest
 * Transforms modern JavaScript for testing
 */

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [
    '@babel/plugin-proposal-private-property-in-object'
  ]
};
