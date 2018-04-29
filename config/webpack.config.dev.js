'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

var paths = require('./paths');
var path = require('path');

var publicPath = '/';
var publicUrl = '';

function resolve(name){
  return path.resolve(__dirname, '../' + name);
}

module.exports = {
  devtool: 'cheap-module-source-map',
  target: 'web',
  mode: 'development',
  devServer: {
    contentBase: './public'
  },
  entry: [
    paths.appIndexJs
  ],
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  },
  
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|eot|woff|ttf)$/,
        include: [resolve('src'), resolve('node_modules')],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: resolve('node_modules'),
        include: resolve('src'),
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        include: [resolve('src'), resolve('node_modules')],
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.json$/,
        include: [resolve('src')],
        exclude: resolve('node_modules'),
        loader: 'json-loader'
      },
      {
        test: /\.svg$/,
        include: [resolve('src')],
        exclude: resolve('node_modules'),
        loader: 'file-loader',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }
    ]
  },
  
  plugins: [
  ]
};
