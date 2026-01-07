import type { Config } from 'tailwindcss';
import sharedConfig from '@campus-os/config/tailwind';

const config: Config = {
  ...sharedConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('tailwindcss-animate')],
};

export default config;
