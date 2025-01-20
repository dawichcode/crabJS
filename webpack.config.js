const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'CrabJs',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `/*!
 * CrabJs v1.0.0
 * (c) ${new Date().getFullYear()} Muvle Studio, inc
 * Released under the MIT License.
 * Muvle Nigeria Limited
 * https://muvleltd.org
 */`,
      raw: true,
    }),
  ],
}; 