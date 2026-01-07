import { MenuItem } from '../../domain/entities/menuItem';

export const listMenu = async (): Promise<MenuItem[]> => {
  // Placeholder: replace with repository call
  return [
    new MenuItem({ id: 'coffee', name: 'Coffee', priceCents: 250, available: true }),
    new MenuItem({ id: 'tea', name: 'Tea', priceCents: 200, available: true })
  ];
};
