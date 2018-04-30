const webpack = require('webpack')
require('babel-core/register')
require('babel-polyfill')

const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const extractSass = new ExtractTextPlugin('[name].css')

module.exports = [
  {
    entry: {
      main: ['babel-polyfill', path.resolve(__dirname, 'src/index.js')]
    },
    output: {
      path: path.resolve(__dirname, 'dist/js/'),
      publicPath: './dist/js/',
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js(|x)$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: {}
        },
        {
          test: /\.js(|x)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {}
          }
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          comments: false
        }
      })
    ],
    resolve: {
      extensions: ['.js', '.jsx']
    }
  },
  {
    entry: {
      main: './src/seseki.scss'
    },
    output: {
      path: path.resolve(__dirname, 'dist/css'),
      publicPath: './dist/css/',
      filename: '[name].css'
    },
    module: {
      rules: [
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: 'url-loader'
            }
          ]
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: extractSass.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
        }
      ]
    },
    plugins: [
      extractSass,
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ],
    resolve: {
      extensions: ['.css', '.js', '.jsx']
    }
  }
]
