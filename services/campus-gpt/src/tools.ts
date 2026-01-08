// Tool definitions for Azure OpenAI function calling
export const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'getEvents',
      description:
        'Get upcoming campus events. Use this when the user asks about events, workshops, seminars, or what is happening on campus.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description:
              'Filter by event category (e.g., "workshop", "seminar", "cultural", "sports", "technical")',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of events to return (default: 5)',
          },
          search: {
            type: 'string',
            description: 'Search term to filter events by title or description',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getMenuItems',
      description:
        'Get canteen menu items. Use this when the user asks about food, menu, canteen, what to eat, or wants to order something.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['BEVERAGES', 'SNACKS', 'MEALS', 'DESSERTS', 'SPECIALS'],
            description: 'Filter by food category',
          },
          maxPrice: {
            type: 'number',
            description: 'Maximum price in rupees',
          },
          available: {
            type: 'boolean',
            description: 'Only show available items (default: true)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getClubs',
      description:
        'Get campus clubs and organizations. Use this when the user asks about clubs, societies, or wants to join activities.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description:
              'Filter by club category (e.g., "technical", "cultural", "sports", "literary")',
          },
          search: {
            type: 'string',
            description: 'Search term to filter clubs by name or description',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'createCanteenOrder',
      description:
        'Create a canteen food order. Use this when the user explicitly wants to order food items.',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                menuItemId: { type: 'string' },
                quantity: { type: 'number' },
              },
              required: ['menuItemId', 'quantity'],
            },
            description: 'List of items to order with quantities',
          },
          deliveryLocation: {
            type: 'string',
            description: 'Where to deliver the order (e.g., "Library", "Lab 202")',
          },
        },
        required: ['items'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'registerForEvent',
      description:
        'Register the user for a campus event. Use this when the user wants to sign up or register for an event.',
      parameters: {
        type: 'object',
        properties: {
          eventId: {
            type: 'string',
            description: 'The ID of the event to register for',
          },
        },
        required: ['eventId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'explainConcept',
      description:
        'Explain an academic concept or help with study material. Use this for educational questions about programming, science, math, etc.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'The topic or concept to explain',
          },
          level: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
            description: 'Complexity level of the explanation',
          },
        },
        required: ['topic'],
      },
    },
  },
];

export type ToolName =
  | 'getEvents'
  | 'getMenuItems'
  | 'getClubs'
  | 'createCanteenOrder'
  | 'registerForEvent'
  | 'explainConcept';
