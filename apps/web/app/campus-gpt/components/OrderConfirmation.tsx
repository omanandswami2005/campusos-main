'use client';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  total: number;
  deliveryLocation: string;
  status: string;
  estimatedReadyTime: string;
  otp: string;
}

interface OrderConfirmationProps {
  order: Order;
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl shadow-lg animate-bounce">
          ✓
        </div>
        <div>
          <h3 className="font-bold text-green-700 dark:text-green-400 text-lg">Order Confirmed!</h3>
          <p className="text-sm text-green-600 dark:text-green-500">{order.orderId}</p>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
          Order Items
        </h4>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">₹{item.subtotal}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center">
            <span className="font-bold text-gray-900 dark:text-white">Total</span>
            <span className="font-bold text-lg text-green-600 dark:text-green-400">
              ₹{order.total}
            </span>
          </div>
        </div>
      </div>

      {/* OTP */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-center mb-3">
        <p className="text-xs text-indigo-100 uppercase tracking-wider mb-1">Collection OTP</p>
        <p className="text-3xl font-bold text-white tracking-[0.3em]">{order.otp}</p>
        <p className="text-xs text-indigo-200 mt-1">Show this at the counter</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">📍 Pickup</p>
          <p className="font-medium text-gray-900 dark:text-white">{order.deliveryLocation}</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">⏱️ Ready in</p>
          <p className="font-medium text-gray-900 dark:text-white">{order.estimatedReadyTime}</p>
        </div>
      </div>
    </div>
  );
}
