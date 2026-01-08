'use client';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  isVeg: boolean;
  spiceLevel?: string;
}

interface MenuCardProps {
  items: MenuItem[];
}

const spiceLevelEmojis: Record<string, string> = {
  mild: '🌶️',
  medium: '🌶️🌶️',
  spicy: '🌶️🌶️🌶️',
};

export function MenuCard({ items }: MenuCardProps) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            {/* Veg/Non-veg indicator */}
            <div
              className={`flex-shrink-0 w-5 h-5 border-2 rounded ${
                item.isVeg ? 'border-green-500' : 'border-red-500'
              } flex items-center justify-center`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                {item.spiceLevel && (
                  <span className="text-xs">{spiceLevelEmojis[item.spiceLevel] || ''}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {item.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{item.price}</span>
              <button className="opacity-0 group-hover:opacity-100 px-3 py-1 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all">
                Add
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Category summary */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
        <span>🍽️ {items.length} items shown</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-green-500 rounded flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            </span>
            Veg
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-red-500 rounded flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            </span>
            Non-veg
          </span>
        </span>
      </div>
    </div>
  );
}
