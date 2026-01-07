import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alt: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://github.com/shadcn.png',
    alt: 'shadcn',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'JD',
    alt: 'John Doe',
  },
};

export const Small: Story = {
  args: {
    alt: 'John Doe',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    alt: 'John Doe',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    alt: 'John Doe',
    size: 'xl',
  },
};
