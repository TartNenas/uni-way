// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure we resolve platform-specific files
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.tsx', 'web.ts', 'web.jsx', 'web.js'
];

// Add any custom configurations here
config.resolver.assetExts.push('cjs');

module.exports = config; 