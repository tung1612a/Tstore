import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Store from "../models/Store.js";

export const getProducts = async (req, res) => {
  const { q, categoryId, sellerId } = req.query;
  const filter = {};
  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }
  if (categoryId) {
    filter.categoryId = categoryId;
  }
  if (sellerId) {
    filter.sellerId = sellerId;
  }
  
  const products = await Product.find(filter).populate("sellerId", "fullName");
  
  // Aggregate inventory quantities for each product
  const productsWithInventory = await Promise.all(
    products.map(async (product) => {
      const [inventory, store] = await Promise.all([
        Inventory.findOne({ productId: product._id }),
        Store.findOne({ sellerId: product.sellerId?._id })
      ]);
      const totalQuantity = inventory ? inventory.quantity : 0;
      const storeInfo = store ? { storeName: store.storeName, status: store.status, bannerImageURL: store.bannerImageURL } : null;

      return {
        ...product.toObject(),
        inventoryQuantity: totalQuantity,
        storeInfo
      };
    })
  );
  
  res.json(productsWithInventory);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("sellerId", "fullName");
  if (!product) return res.status(404).json({ message: "Product not found" });
  
  // Get inventory quantity for this product
  const [inventory, store] = await Promise.all([
    Inventory.findOne({ productId: product._id }),
    Store.findOne({ sellerId: product.sellerId?._id })
  ]);
  const totalQuantity = inventory ? inventory.quantity : 0;
  const storeInfo = store ? { storeName: store.storeName, status: store.status, bannerImageURL: store.bannerImageURL } : null;

  const productWithInventory = {
    ...product.toObject(),
    inventoryQuantity: totalQuantity,
    storeInfo
  };
  
  res.json(productWithInventory);
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};
