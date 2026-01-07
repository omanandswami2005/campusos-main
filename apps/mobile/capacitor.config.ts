import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campusos.app',
  appName: 'Campus OS',
  webDir: 'dist',
  server: {
    // For live reload during development
    url: process.env.VITE_DEV_SERVER_URL,
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
