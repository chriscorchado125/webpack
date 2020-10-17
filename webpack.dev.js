const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {

  // This option controls if and how source maps are generated.
  // https://webpack.js.org/configuration/devtool/
  devtool: 'eval-cheap-module-source-map',

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    about: './src/about/main.js',
    history: './src/history/main.js',
    course: './src/course/main.js',
    project: './src/project/main.js',
    contact: './src/contact/main.js'
  },

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 8080,
    writeToDisk: false // https://webpack.js.org/configuration/dev-server/#devserverwritetodisk-
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
        test: /\.(sa|sc|c)ss$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
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
  ],
}
