import { prisma } from '../state/memory';
import { MenuItem } from '../../domain/entities/menuItem';

export const listMenu = async (collegeId?: string): Promise<MenuItem[]> => {
  const items = await prisma.menuItem.findMany({
    where: {
      available: true,
      ...(collegeId && { collegeId }),
    },
    orderBy: { name: 'asc' },
  });

  return items.map(
    (m) =>
      new MenuItem({
        id: m.id,
        name: m.name,
        description: m.description || '',
        priceCents: m.priceCents,
        category: m.category.toLowerCase() as any,
        available: m.available,
        imageUrl: m.imageUrl || '',
        collegeId: m.collegeId,
      })
  );
};
