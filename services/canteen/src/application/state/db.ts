// Database repository for canteen service
import { memory, type MenuItem, type Order, type PromotionalOffer } from './memory.js';

const USE_DATABASE = true; // Hardcoded to try true, but with fallback

// Dynamic import for Prisma
let prisma: any = null;
import('@campus-os/database')
  .then((mod) => {
    prisma = mod.prisma;
    console.log('✅ Canteen service connected to database');
  })
  .catch((err) => {
    console.warn('⚠️ Database not available, using in-memory store');
    console.warn(err);
  });

// ============================================================================
// MENU REPOSITORY
// ============================================================================

export async function getMenuItems(collegeId?: string): Promise<MenuItem[]> {
  if (!prisma) return memory.menu.filter((i) => !collegeId || i.collegeId === collegeId);

  try {
    const items = await prisma.menuItem.findMany({
      where: collegeId ? { collegeId } : {},
    });
    return items.map((i: any) => ({
      ...i,
      priceCents: i.priceCents,
    }));
  } catch (e) {
    console.error('DB Error:', e);
    return memory.menu.filter((i) => !collegeId || i.collegeId === collegeId);
  }
}

// ============================================================================
// ORDER REPOSITORY
// ============================================================================

export async function getOrders(collegeId?: string, userId?: string): Promise<Order[]> {
  if (!prisma) {
    let orders = Array.from(memory.orders.values());
    if (collegeId) orders = orders.filter((o) => o.collegeId === collegeId);
    if (userId) orders = orders.filter((o) => o.userId === userId);
    return orders;
  }

  try {
    const where: any = {};
    if (collegeId) where.collegeId = collegeId;
    if (userId) where.userId = userId;

    const orders = await prisma.canteenOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o: any) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error('DB Error:', e);
    return [];
  }
}

export async function createOrder(data: any): Promise<Order> {
  if (!prisma) {
    const id = `order-${Date.now()}`;
    const order = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memory.orders.set(id, order);
    return order;
  }

  try {
    const order = await prisma.canteenOrder.create({
      data: {
        userId: data.userId,
        collegeId: data.collegeId,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        items: {
          create: data.items.map((i: any) => ({
            itemId: i.itemId,
            name: i.name,
            priceCents: i.priceCents,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (e) {
    console.error('DB Error:', e);
    throw e;
  }
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
  if (!prisma) {
    const order = memory.orders.get(id);
    if (!order) return null;
    const updated = { ...order, ...data, updatedAt: new Date().toISOString() };
    memory.orders.set(id, updated);
    return updated;
  }

  try {
    const order = await prisma.canteenOrder.update({
      where: { id },
      data,
      include: { items: true },
    });
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (e) {
    console.error('DB Error:', e);
    return null;
  }
}

// ============================================================================
// OFFER REPOSITORY
// ============================================================================

export async function getOffers(collegeId?: string): Promise<PromotionalOffer[]> {
  if (!prisma) return memory.offers.filter((o) => !collegeId || o.collegeId === collegeId);

  try {
    const offers = await prisma.promotionalOffer.findMany({
      where: collegeId ? { collegeId } : {},
    });
    return offers.map((o: any) => ({
      ...o,
      startDate: o.startDate.toISOString(),
      endDate: o.endDate.toISOString(),
    }));
  } catch (e) {
    console.error('DB Error:', e);
    return memory.offers;
  }
}

export { memory, prisma };
