module.exports = {
    // Other Webpack configuration
    module: {
      rules: [
        // Other rules
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          exclude: [
            /isomorphic-xml2js/ // Ignore source maps for this package
          ]
        }
      ]
    }
  };
  