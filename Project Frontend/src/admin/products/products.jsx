import ProductsTable from "./components/ProductsTable";

const Products = () => {
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-white">Products</h1>
      </div>

      <ProductsTable />
    </div>
  );
};

export default Products;
