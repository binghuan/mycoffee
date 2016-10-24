var path = require('path')
var webpack = require('webpack')

module.exports = {
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client',
    './index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
          test: /\.scss$/,
          loader: "style-loader!css-loader!sass-loader"
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss'],
  }
}
