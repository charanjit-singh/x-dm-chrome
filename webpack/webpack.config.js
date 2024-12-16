const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  watch: process.env.NODE_ENV !== "production",
  devtool: process.env.NODE_ENV === "production" ? false : "inline-source-map",
  watchOptions: {
    // Ignore dist folder and node_modules
    ignored: /node_modules|dist/,
  },
  entry: {
    background: path.resolve(__dirname, "..", "src", "background.ts"),
    inject: path.resolve(__dirname, "..", "src", "inject.ts"),
    content: path.resolve(__dirname, "..", "src", "content.ts"),
    options: path.resolve(__dirname, "..", "src", "options.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "..", "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }],
    }),
    new Dotenv(),
  ],
};
