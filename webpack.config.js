const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DashboardPlugin = require("webpack-dashboard/plugin");
const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: './src/index.tsx',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.[hash].js'
    },

    mode: 'development',

    module: {
        rules: [
            {
                test: /\.css$|\.scss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                },
                exclude: /node_modules/,
            }
        ]
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            Slices: path.resolve(__dirname, './src/slices'),
            Hook: path.resolve(__dirname, './src/hook.tsx'),
            Pages: path.resolve(__dirname, './src/pages'),
            Middleware: path.resolve(__dirname, './src/middleware.ts'),
            Store: path.resolve(__dirname, './src/store.ts'),
            Routes: path.resolve(__dirname, './src/routes.tsx'),
            Components: path.resolve(__dirname, './src/components'),
            Configs: path.resolve(__dirname, './src/configs')

        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: "index.[hash].css"
        }),
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        }),
        new DashboardPlugin()
    ],

    performance: {
        hints: false,
    },

    devtool: 'inline-source-map',

    devServer: {
        historyApiFallback: true,
        allowedHosts: 'all',
    },
};