require("webpack");
require("babel-core/register");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin("[name].css");

module.exports = [
  {
    entry: {
      main: "./src/seseki.js"
    },
    output: {
      path: path.resolve(__dirname, "dist/js"),
      publicPath: "/js/",
      filename: "[name].js"
    },
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js(|x)$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {}
        },
        {
          test: /\.js(|x)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {}
          }
        }
      ]
    },
    plugins: [],
    resolve: {
      extensions: [".js", ".jsx"]
    }
  },
  {
    entry: {
      main: "./src/seseki.scss"
    },
    output: {
      path: path.resolve(__dirname, "dist/css"),
      publicPath: "/css/",
      filename: "[name].css"
    },
    module: {
      rules: [
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: "url-loader"
            }
          ]
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: extractSass.extract({
            fallback: "style-loader",
            use: ["css-loader", "sass-loader"]
          })
        }
      ]
    },
    plugins: [extractSass],
    resolve: {
      extensions: [".css", ".js", ".jsx"]
    },
    devServer: {
      contentBase: "./dist",
      port: 8080,
      hot: true,
      inline: true,
    }
  }
];
