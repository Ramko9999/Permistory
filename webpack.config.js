const { resolve } = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

function publicToDistPattern(publicPath) {
  return {
    from: resolve(__dirname, "public", publicPath),
    to: resolve(__dirname, "dist", publicPath),
  };
}

module.exports = {
  mode: "production",
  entry: {
    app: "./src/app/index.tsx",
    popup: "./src/popup/index.ts",
    background: "./src/background/index.ts",
    contentScript: "./src/content-script/index.ts",
    injectScript: "./src/inject-script/index.ts",
  },
  output: {
    path: resolve(__dirname, "dist", "js"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: { compilerOptions: { noEmit: false } },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new HTMLPlugin({
      title: "Popup",
      chunks: ["popup"],
      filename: resolve(__dirname, "dist", "popup.html"),
    }),
    new HTMLPlugin({
      template: resolve(__dirname, "public", "app.html"),
      title: "Permistory",
      chunks: ["app"],
      filename: resolve(__dirname, "dist", "app.html"),
    }),
    new CopyPlugin({
      patterns: [
        publicToDistPattern("manifest.json"),
        publicToDistPattern("robots.txt"),
        publicToDistPattern("assets/")
      ],
    }),
  ],
};
