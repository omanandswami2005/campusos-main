import { getMenuItems } from '../state/db.js';
import type { MenuItem } from '@campus-os/types';

export const listMenu = async (collegeId?: string): Promise<MenuItem[]> => {
  return getMenuItems(collegeId);
};
