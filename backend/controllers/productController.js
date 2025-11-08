import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

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
  
  // Add store info to each product
  const productsWithStoreInfo = await Promise.all(
    products.map(async (product) => {
      const [store, seller] = await Promise.all([
        Store.findOne({ sellerId: product.sellerId?._id }),
        User.findById(product.sellerId?._id).select('avatarUrl')
      ]);
      const storeInfo = store ? { 
        storeName: store.storeName, 
        status: store.status, 
        bannerImageURL: store.bannerImageURL,
        avatarUrl: seller?.avatarUrl || null
      } : null;

      return {
        ...product.toObject(),
        inventoryQuantity: product.stock ?? 0,
        storeInfo
      };
    })
  );
  
  res.json(productsWithStoreInfo);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("sellerId", "fullName");
  if (!product) return res.status(404).json({ message: "Product not found" });
  
  // Get store info for this product
  const [store, seller] = await Promise.all([
    Store.findOne({ sellerId: product.sellerId?._id }),
    User.findById(product.sellerId?._id).select('avatarUrl')
  ]);
  const storeInfo = store ? { 
    storeName: store.storeName, 
    status: store.status, 
    bannerImageURL: store.bannerImageURL,
    avatarUrl: seller?.avatarUrl || null
  } : null;

  // Đếm số lượng đơn hàng đã hoàn thành (completed hoặc delivered) có chứa sản phẩm này
  const orderItemsWithProduct = await OrderItem.find({ productId: product._id });
  const orderIds = orderItemsWithProduct.map(item => item.orderId);
  
  const completedOrdersCount = await Order.countDocuments({
    _id: { $in: orderIds },
    status: { $in: ['completed', 'delivered'] }
  });

  // Tính tổng số lượng sản phẩm đã bán (từ các đơn hàng đã hoàn thành)
  const completedOrders = await Order.find({
    _id: { $in: orderIds },
    status: { $in: ['completed', 'delivered'] }
  }).select('_id');
  
  const completedOrderIds = completedOrders.map(o => o._id);
  const soldItems = await OrderItem.find({
    productId: product._id,
    orderId: { $in: completedOrderIds }
  });
  
  const totalSoldQuantity = soldItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const productWithInfo = {
    ...product.toObject(),
    inventoryQuantity: product.stock ?? 0,
    storeInfo,
    sold: totalSoldQuantity, // Tổng số lượng đã bán
    completedOrdersCount // Số đơn hàng đã hoàn thành
  };
  
  res.json(productWithInfo);
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
