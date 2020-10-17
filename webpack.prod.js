const path = require('path')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const buildPath = path.resolve(__dirname, 'dist')

module.exports = {

  // This option controls if and how source maps are generated.
  // https://webpack.js.org/configuration/devtool/
  devtool: 'source-map',

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    about: './src/about/main.js',
    history: './src/history/main.js',
    course: './src/course/main.js',
    project: './src/project/main.js',
    contact: './src/contact/main.js'
  },

  // how to write the compiled files to disk
  // https://webpack.js.org/concepts/output/
  output: {
    filename: '[name].[hash:20].js',
    path: buildPath
  },

  // https://webpack.js.org/concepts/loaders/
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
    ]
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: [
    new CleanWebpackPlugin(), // cleans output.path by default
    new HtmlWebpackPlugin({
      template: './src/about/tmpl.html',
      inject: 'body',
      chunks: ['about'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/history/tmpl.html',
      inject: 'body',
      chunks: ['history'],
      filename: 'companies.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/course/tmpl.html',
      inject: 'body',
      chunks: ['course'],
      filename: 'courses.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/project/tmpl.html',
      inject: 'body',
      chunks: ['project'],
      filename: 'projects.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/contact/tmpl.html',
      inject: 'body',
      chunks: ['contact'],
      filename: 'contact.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    })
  ],

  // https://webpack.js.org/configuration/optimization/
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCssAssetsPlugin({})
    ]
  }
}
