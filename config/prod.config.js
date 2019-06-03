const path = require('path')
const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const commonConfig = require('./common.config')

const prodConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          }, 
          'css-loader', 
          'postcss-loader'
        ]
      },
      {
        test: /\.styl$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          }, 
          'css-loader', 
          'postcss-loader', 
          'stylus-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css'
    })
  ],
  optimization: {
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: false
        }
      }
    }), new OptimizeCSSAssetsPlugin()]
  }
}

module.exports = merge(commonConfig, prodConfig)