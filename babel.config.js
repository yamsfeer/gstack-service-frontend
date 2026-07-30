module.exports = {
  plugins: [
    ['component', {
      libraryName: '@gs-ui/gs-ui',
      styleLibraryName: 'theme'
    }],
    ['@babel/plugin-proposal-decorators', { 'legacy': true }]
  ],
  presets: [
    '@vue/app'
  ]
};
