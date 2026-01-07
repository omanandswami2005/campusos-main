import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Badge } from './Badge';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const data: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
];

const columns = [
  { key: 'name', header: 'Name', className: 'font-medium' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (item: User) => (
      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge>
    ),
  },
];

export const Default: Story = {
  args: {
    columns,
    data,
    keyExtractor: (item: User) => item.id,
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
    keyExtractor: (item: User) => item.id,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No users found.',
    keyExtractor: (item: User) => item.id,
  },
};
