import type { Config } from 'tailwindcss';
import sharedConfig from '@campus-os/config/tailwind';

const config: Config = {
  ...sharedConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  plugins: [require('tailwindcss-animate')],
};

export default config;
