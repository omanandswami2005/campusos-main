import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const TabsDemo = () => {
  const [value, setValue] = useState('account');

  return (
    <Tabs value={value} onValueChange={setValue} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="p-4 border rounded mt-2">
          <h3 className="font-semibold">Account</h3>
          <p className="text-sm text-gray-600">Manage your account settings here.</p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="p-4 border rounded mt-2">
          <h3 className="font-semibold">Password</h3>
          <p className="text-sm text-gray-600">Change your password here.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export const Default: Story = {
  render: () => <TabsDemo />,
};
