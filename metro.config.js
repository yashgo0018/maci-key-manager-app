const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  crypto: require.resolve("expo-crypto"),
  // "@zk-kit/utils/conversions": require.resolve(
  //   "./node_modules/@zk-kit/utils/dist/lib.esm/conversions.js"
  // ),
  stream: require.resolve("stream-browserify"),
  path: require.resolve("path-browserify"),
};

module.exports = defaultConfig;
