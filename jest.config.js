module.exports = {
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|svg|ttf|woff|woff2)$": "<rootDir>/file-mock.js",
  },
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  testMatch: ["<rootDir>/test/**/*.test.js"],
};
