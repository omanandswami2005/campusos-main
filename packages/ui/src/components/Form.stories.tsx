import type { Meta, StoryObj } from '@storybook/react';
import { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { useId } from 'react';

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simple Form Demo without react-hook-form context for pure visual testing
const SimpleFormDemo = () => {
  const id = useId();
  return (
    <Form className="w-[350px] border p-4 rounded-lg">
      <FormItem>
        <FormLabel htmlFor={`${id}-email`}>Email</FormLabel>
        <FormControl>
          <Input id={`${id}-email`} placeholder="m@example.com" />
        </FormControl>
        <FormDescription>We'll never share your email.</FormDescription>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel htmlFor={`${id}-password`}>Password</FormLabel>
        <FormControl>
          <Input id={`${id}-password`} type="password" />
        </FormControl>
        <FormMessage error="Password is required" />
      </FormItem>

      <Button className="mt-4 w-full">Submit</Button>
    </Form>
  );
};

export const Default: Story = {
  render: () => <SimpleFormDemo />,
};
