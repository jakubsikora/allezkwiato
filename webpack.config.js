var webpack = require('webpack');

module.exports = {
  entry: './app/index.js',
  output: {
    path: './app/',
    filename: 'bundle.js'
  },
  externals: [],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
};