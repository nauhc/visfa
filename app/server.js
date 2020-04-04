var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var config = require("./webpack.config");
const url = require("url");
const express = require("express");

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  // It suppress error shown in console, so it has to be set to false.
  quiet: false,
  // It suppress everything except error, so it has to be set to false as well
  // to see success build.
  noInfo: false,
  stats: "normal"
}).listen(3000, "localhost", function(err) {
  if (err) {
    console.log(err);
  }
  console.log("Listening at localhost:3000");
});
