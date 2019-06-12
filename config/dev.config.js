const path = require('path')
const merge = require('webpack-merge')
const commonConfig = require('./common.config')

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    writeToDisk: false,
    contentBase: path.join(__dirname, 'build'),
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'stylus-loader']
      }
    ]
  }
}

module.exports = merge(commonConfig, devConfig)

