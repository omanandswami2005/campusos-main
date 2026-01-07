import { memory } from '../state/memory';
import { MenuItem } from '../../domain/entities/menuItem';

export const listMenu = async (collegeId?: string): Promise<MenuItem[]> => {
  const items = memory.menu
    .filter((m) => m.available)
    .filter((m) => (collegeId ? m.collegeId === collegeId : true));
  return items.map((m) => new MenuItem(m));
};
