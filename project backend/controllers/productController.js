import { products } from "../";

export const getProducts = (req, res) => {
  res.json({
    message: "get all products successfully",
    data: products,
  });
};

export const getSingleProduct = (req, res) => {
  const productId = req.params.productId;

  const sigleProduct = products.find((product) => product.id == productId);

  res.json(sigleProduct);
};

export const createProduct = (req, res) => {
  const product = req.body;
  const response = {
    message: "product created successfully",
    data: product,
  };
  res.json(response);
};

export const updateProduct = (req, res) => {
  const { id } = req.params;
  res.send(`updated product ${id}`);
};

export const deleteProduct = (req, res) => {
  res.send("deleted product successfully");
};