import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: 'This is an informational alert message.',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'This is an error alert message. Please fix the issue.',
  },
};

export const WithTitle: Story = {
  render: () => (
    <Alert>
      <div className="font-medium">Heads up!</div>
      <div className="text-sm">You can add components to your app using the CLI.</div>
    </Alert>
  ),
};

export const ErrorWithTitle: Story = {
  render: () => (
    <Alert variant="destructive">
      <div className="font-medium">Error</div>
      <div className="text-sm">Your session has expired. Please log in again.</div>
    </Alert>
  ),
};
