import type { Config } from 'tailwindcss';
import sharedConfig from '@campus-os/config/tailwind';

const config: Config = {
  ...sharedConfig,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      ...sharedConfig.theme?.extend,
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
