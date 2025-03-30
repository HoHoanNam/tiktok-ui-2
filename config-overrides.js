const { override, useBabelRc } = require('customize-cra');

module.exports = override(
  // Nạp file .babelrc vào cấu hình của Webpack
  useBabelRc()
);
