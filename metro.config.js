const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add PDF to the list of asset extensions so Metro can bundle them
config.resolver.assetExts.push('pdf');

module.exports = config;
