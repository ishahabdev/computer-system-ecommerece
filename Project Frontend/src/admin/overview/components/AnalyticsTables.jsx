const orders = [
  {
    id: "#1001",
    customer: "Alice",
    date: "Jun 18, 02:00",
    total: "120.5",
    status: "Paid",
  },
  {
    id: "#1002",
    customer: "Bob",
    date: "Jun 17, 02:00",
    total: "89.99",
    status: "Pending",
  },
  {
    id: "#1003",
    customer: "Charlie",
    date: "Jun 16, 02:00",
    total: "45",
    status: "Paid",
  },
  {
    id: "#1004",
    customer: "Diana",
    date: "Jun 15, 02:00",
    total: "210",
    status: "Failed",
  },
  {
    id: "#1005",
    customer: "Eve",
    date: "Jun 14, 02:00",
    total: "67.25",
    status: "Paid",
  },
];

const products = [
  {
    name: 'MacBook Pro 16"',
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80",
    stock: "Low Stock",
    type: "low",
  },
  {
    name: "iPhone 15 Pro",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=100&q=80",
    stock: "Out Of Stock",
    type: "out",
  },
  {
    name: "Dell UltraSharp 27",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&q=80",
    stock: "In Stock",
    type: "in",
  },
  {
    name: "Logitech MX Master 3S",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=100&q=80",
    stock: "Low Stock",
    type: "low",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    Pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    Failed: "border-red-500/40 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium ${
        styles[status] || ""
      }`}
    >
      {status}
    </span>
  );
}

function StockBadge({ stock, type }) {
  const styles = {
    low: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    out: "border-red-500/30 bg-red-500/10 text-red-400",
    in: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[8px] font-medium ${
        styles[type] || ""
      }`}
    >
      {stock}
    </span>
  );
}

export function LatestOrders() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
      <h3 className="text-[13px] font-semibold text-white">
        Latest Orders
      </h3>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-2 py-2 text-left text-[9px] font-medium text-gray-400">
                Order
              </th>

              <th className="px-2 py-2 text-left text-[9px] font-medium text-gray-400">
                Customer
              </th>

              <th className="px-2 py-2 text-left text-[9px] font-medium text-gray-400">
                Date
              </th>

              <th className="px-2 py-2 text-left text-[9px] font-medium text-gray-400">
                Total
              </th>

              <th className="px-2 py-2 text-left text-[9px] font-medium text-gray-400">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/[0.04] last:border-0"
              >
                <td className="px-2 py-2.5 text-[9px] text-gray-500">
                  {order.id}
                </td>

                <td className="px-2 py-2.5 text-[9px] text-gray-400">
                  {order.customer}
                </td>

                <td className="px-2 py-2.5 text-[9px] text-gray-500">
                  {order.date}
                </td>

                <td className="px-2 py-2.5 text-[9px] text-gray-400">
                  {order.total}
                </td>

                <td className="px-2 py-2.5">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PopularProducts() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
      <h3 className="text-[13px] font-semibold text-white">
        Popular Products
      </h3>

      <div className="mt-2">
        <div className="grid grid-cols-[60px_1fr_80px] border-b border-white/[0.06] px-2 py-2">
          <span className="text-[9px] font-medium text-gray-400">
            Image
          </span>

          <span className="text-[9px] font-medium text-gray-400">
            Product
          </span>

          <span className="text-[9px] font-medium text-gray-400">
            Stock
          </span>
        </div>

        {products.map((product) => (
          <div
            key={product.name}
            className="grid grid-cols-[60px_1fr_80px] items-center border-b border-white/[0.04] px-2 py-2 last:border-0"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-[#292929]">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <span className="text-[9px] text-gray-400">
              {product.name}
            </span>

            <StockBadge
              stock={product.stock}
              type={product.type}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsTables() {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <LatestOrders />
      <PopularProducts />
    </div>
  );
}