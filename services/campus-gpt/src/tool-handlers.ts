// Tool handlers - Execute tool calls against database/mock data
import type { ToolName } from './tools.js';

// Mock data for hackathon demo
const mockEvents = [
  {
    id: 'evt-001',
    title: 'AI/ML Workshop: Building with Azure OpenAI',
    description:
      'Hands-on workshop on building AI applications using Azure OpenAI and Cognitive Services',
    category: 'technical',
    startDate: '2026-01-15T10:00:00Z',
    endDate: '2026-01-15T16:00:00Z',
    location: 'Tech Lab 301',
    capacity: 50,
    registeredCount: 35,
    imageUrl: '/events/ai-workshop.jpg',
    tags: ['AI', 'Azure', 'Workshop'],
  },
  {
    id: 'evt-002',
    title: 'Hackathon: Code for Campus',
    description:
      'Build innovative solutions for campus problems. Great prizes and networking opportunities!',
    category: 'technical',
    startDate: '2026-01-20T09:00:00Z',
    endDate: '2026-01-21T18:00:00Z',
    location: 'Main Auditorium',
    capacity: 200,
    registeredCount: 150,
    imageUrl: '/events/hackathon.jpg',
    tags: ['Hackathon', 'Coding', 'Competition'],
  },
  {
    id: 'evt-003',
    title: 'Cultural Night: Fusion 2026',
    description: 'Annual cultural extravaganza featuring music, dance, and drama performances',
    category: 'cultural',
    startDate: '2026-01-25T18:00:00Z',
    endDate: '2026-01-25T22:00:00Z',
    location: 'Open Air Theatre',
    capacity: 500,
    registeredCount: 420,
    imageUrl: '/events/cultural-night.jpg',
    tags: ['Cultural', 'Music', 'Dance'],
  },
  {
    id: 'evt-004',
    title: 'Career Fair 2026',
    description: 'Meet top recruiters from leading tech companies. Bring your resumes!',
    category: 'career',
    startDate: '2026-01-28T10:00:00Z',
    endDate: '2026-01-28T17:00:00Z',
    location: 'Convention Center',
    capacity: 1000,
    registeredCount: 800,
    imageUrl: '/events/career-fair.jpg',
    tags: ['Career', 'Jobs', 'Networking'],
  },
];

const mockMenuItems = [
  {
    id: 'menu-001',
    name: 'Masala Dosa',
    description: 'Crispy dosa with spicy potato filling, served with sambar and chutney',
    category: 'MEALS',
    price: 60,
    available: true,
    imageUrl: '/menu/masala-dosa.jpg',
    isVeg: true,
    spiceLevel: 'medium',
  },
  {
    id: 'menu-002',
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato-based curry with cottage cheese cubes',
    category: 'MEALS',
    price: 120,
    available: true,
    imageUrl: '/menu/paneer-butter.jpg',
    isVeg: true,
    spiceLevel: 'mild',
  },
  {
    id: 'menu-003',
    name: 'Cold Coffee',
    description: 'Chilled coffee with ice cream and chocolate syrup',
    category: 'BEVERAGES',
    price: 50,
    available: true,
    imageUrl: '/menu/cold-coffee.jpg',
    isVeg: true,
  },
  {
    id: 'menu-004',
    name: 'Samosa (2 pcs)',
    description: 'Crispy fried pastry with spiced potato filling',
    category: 'SNACKS',
    price: 30,
    available: true,
    imageUrl: '/menu/samosa.jpg',
    isVeg: true,
    spiceLevel: 'medium',
  },
  {
    id: 'menu-005',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with tender chicken pieces and aromatic spices',
    category: 'MEALS',
    price: 150,
    available: true,
    imageUrl: '/menu/chicken-biryani.jpg',
    isVeg: false,
    spiceLevel: 'spicy',
  },
  {
    id: 'menu-006',
    name: 'Gulab Jamun (2 pcs)',
    description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
    category: 'DESSERTS',
    price: 40,
    available: true,
    imageUrl: '/menu/gulab-jamun.jpg',
    isVeg: true,
  },
];

const mockClubs = [
  {
    id: 'club-001',
    name: 'CodeCraft - Programming Club',
    description: 'Learn to code, participate in hackathons, and build awesome projects together',
    category: 'technical',
    memberCount: 250,
    logoUrl: '/clubs/codecraft.png',
    coordinator: 'Rahul Sharma',
    meetingTime: 'Every Saturday 4 PM',
  },
  {
    id: 'club-002',
    name: 'Rhythm - Music Club',
    description: 'For music enthusiasts - jamming sessions, performances, and music workshops',
    category: 'cultural',
    memberCount: 180,
    logoUrl: '/clubs/rhythm.png',
    coordinator: 'Priya Patel',
    meetingTime: 'Every Friday 5 PM',
  },
  {
    id: 'club-003',
    name: 'Shuttlers - Badminton Club',
    description: 'Play badminton, participate in tournaments, and stay fit',
    category: 'sports',
    memberCount: 120,
    logoUrl: '/clubs/shuttlers.png',
    coordinator: 'Arjun Nair',
    meetingTime: 'Daily 6 AM - 8 AM',
  },
  {
    id: 'club-004',
    name: 'AI Society',
    description: 'Explore artificial intelligence, machine learning, and deep learning',
    category: 'technical',
    memberCount: 200,
    logoUrl: '/clubs/ai-society.png',
    coordinator: 'Dr. Neha Gupta',
    meetingTime: 'Every Wednesday 3 PM',
  },
];

// Tool handler implementations
export async function handleToolCall(
  toolName: ToolName,
  args: Record<string, unknown>
): Promise<{ result: unknown; uiComponent: string }> {
  switch (toolName) {
    case 'getEvents': {
      let events = [...mockEvents];

      if (args.category) {
        events = events.filter(
          (e) => e.category.toLowerCase() === (args.category as string).toLowerCase()
        );
      }
      if (args.search) {
        const search = (args.search as string).toLowerCase();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(search) || e.description.toLowerCase().includes(search)
        );
      }

      const limit = (args.limit as number) || 5;
      events = events.slice(0, limit);

      return {
        result: events,
        uiComponent: 'EventCard',
      };
    }

    case 'getMenuItems': {
      let items = [...mockMenuItems];

      if (args.category) {
        items = items.filter((i) => i.category === args.category);
      }
      if (args.maxPrice) {
        items = items.filter((i) => i.price <= (args.maxPrice as number));
      }
      if (args.available !== false) {
        items = items.filter((i) => i.available);
      }

      return {
        result: items,
        uiComponent: 'MenuCard',
      };
    }

    case 'getClubs': {
      let clubs = [...mockClubs];

      if (args.category) {
        clubs = clubs.filter(
          (c) => c.category.toLowerCase() === (args.category as string).toLowerCase()
        );
      }
      if (args.search) {
        const search = (args.search as string).toLowerCase();
        clubs = clubs.filter(
          (c) =>
            c.name.toLowerCase().includes(search) || c.description.toLowerCase().includes(search)
        );
      }

      return {
        result: clubs,
        uiComponent: 'ClubCard',
      };
    }

    case 'createCanteenOrder': {
      const items = args.items as Array<{ menuItemId: string; quantity: number }>;
      const deliveryLocation = (args.deliveryLocation as string) || 'Canteen Counter';

      // Calculate order total
      let total = 0;
      const orderItems = items
        .map((item) => {
          const menuItem = mockMenuItems.find((m) => m.id === item.menuItemId);
          if (menuItem) {
            const subtotal = menuItem.price * item.quantity;
            total += subtotal;
            return {
              ...menuItem,
              quantity: item.quantity,
              subtotal,
            };
          }
          return null;
        })
        .filter(Boolean);

      const order = {
        orderId: `ORD-${Date.now()}`,
        items: orderItems,
        total,
        deliveryLocation,
        status: 'CONFIRMED',
        estimatedReadyTime: '15-20 minutes',
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
      };

      return {
        result: order,
        uiComponent: 'OrderConfirmation',
      };
    }

    case 'registerForEvent': {
      const eventId = args.eventId as string;
      const event = mockEvents.find((e) => e.id === eventId);

      if (!event) {
        return {
          result: { success: false, message: 'Event not found' },
          uiComponent: 'ErrorMessage',
        };
      }

      const registration = {
        success: true,
        ticketNumber: `TKT-${Date.now()}`,
        eventTitle: event.title,
        eventDate: event.startDate,
        location: event.location,
        message: `Successfully registered for ${event.title}!`,
      };

      return {
        result: registration,
        uiComponent: 'RegistrationConfirmation',
      };
    }

    case 'explainConcept': {
      // This will be handled by the LLM itself with a detailed response
      return {
        result: {
          topic: args.topic,
          level: args.level || 'intermediate',
          type: 'explanation',
        },
        uiComponent: 'ExplanationCard',
      };
    }

    default:
      return {
        result: { error: 'Unknown tool' },
        uiComponent: 'ErrorMessage',
      };
  }
}
