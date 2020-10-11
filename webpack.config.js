const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ImageminWebpackPlugin = require('imagemin-webpack-plugin').default;
const ImageminMozjpeg = require('imagemin-mozjpeg');
const ImageminOptipng = require('imagemin-optipng');
const ImageminSvgo = require('imagemin-svgo');
const ImageminGifsicle = require('imagemin-gifsicle');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Autoprefixer = require('autoprefixer');
const Dotenv = require('dotenv-webpack');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  'use strict';

  const config = {
    splitChunks: {
      chunks: 'all',
    },
  };

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

const filename = (ext) => {
  'use strict';

  return isDev ? `[name].${ext}` : `[name].[hash].${ext}`;
};

const cssLoaders = (extra) => {
  'use strict';

  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true,
      },
    },
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: [Autoprefixer()],
        sourceMap: true,
      },
    },
  ];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const babelOptions = (preset) => {
  'use strict';

  const opts = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties'],
  };

  if (preset) {
    opts.presets.push(preset);
  }

  return opts;
};

const jsLoaders = () => {
  'use strict';

  const loaders = [
    {
      loader: 'babel-loader',
      options: babelOptions(),
    },
  ];

  if (isDev) {
    loaders.push('eslint-loader');
  }

  return loaders;
};

const plugins = () => {
  'use strict';

  const base = [
    new CleanWebpackPlugin(),
    // Заменяет текст в результирующем пакете для любых экземпляров process.env.
    // Ваши .env файлы могут содержать конфиденциальную информацию. Из-за этого в ваш окончательный пакет dotenv-webpack будут доступны только те переменные среды, которые явно указаны в вашем коде
    new Dotenv(),

    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        removeComments: isProd,
        collapseWhitespace: isProd,
      },
    }),

    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/favicon/'),
          to: path.resolve(__dirname, 'dist/assets/favicon/'),
        },
        {
          from: path.resolve(__dirname, 'src/assets/img/'),
          to: path.resolve(__dirname, 'dist/assets/img/'),
        },
      ],
    }),

    new ImageminWebpackPlugin({
      disable: isDev,
      test: /\.(jpe?g|png|gif|svg)$/i,
      plugins: [
        ImageminMozjpeg({
          quality: 100,
          progressive: true,
        }),
        ImageminOptipng({
          quality: 100,
          progressive: true,
        }),
        ImageminSvgo({
          quality: 100,
          progressive: true,
        }),
        ImageminGifsicle({
          quality: 100,
          progressive: true,
        }),
      ],
    }),
  ];

  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
  }

  return base;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),

  mode: 'development',

  entry: {
    main: ['@babel/polyfill', './index.js'],
  },

  output: {
    filename: `./assets/js/${filename('js')}`,
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.js', '.json', '.scss'],
  },

  optimization: optimization(),

  devServer: {
    port: 4444,
    hot: isDev,
    watchContentBase: true,
  },

  devtool: isDev ? 'source-map' : '',

  plugins: plugins(),

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader'),
      },

      {
        test: /\.(png|jpg|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/img',
            },
          },
        ],
      },

      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/fonts',
            },
          },
        ],
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
    ],
  },
};
