const path = require('path')
const config = require('../app.json')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ManifestWebpackPlugin = require('../plugins/manifest-webpack-plugin')

module.exports = {
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../src'),
      root: path.resolve(__dirname, '../'),
      styles: path.resolve(__dirname, '../src/styles')
    },
    extensions: [
      '.js'
    ]
  },
  entry: {
    app: path.resolve(__dirname, '../src/app.js')
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    publicPath: config.publicPath
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          { 
            loader: 'file-loader',
            options: {
              emitFile: false,
              name: 'assets/image/[name].[ext]?v='+config.version
            }
          }
        ]  
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      config,
      minify: {
        collapseWhitespace: true,
        preserveLineBreaks: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      inject: false,
      template: 'src/index.ejs',
      filename: 'index.html'
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: 'src/assets', to: 'assets'}
    ]),
    new ManifestWebpackPlugin({
      disable: false,
      source: '../src/assets',
      output: '../src'
    })
  ],
  performance: false,
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /\.js$/,
          name: 'vendors'
        },
        styles: {
          test: /\.css|styl$/,
          name: 'styles'
        }
      }
    },
    usedExports: true
  },
  stats: {
    assets: false,
    warnings: false
  }
}