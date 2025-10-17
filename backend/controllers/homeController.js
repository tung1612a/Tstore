import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Store from "../models/Store.js";

export const getHome = async (req, res) => {
  try {
    const [latestProducts, totalProducts, totalCategories, totalStores] = await Promise.all([
      // Remove non-existent status filter and populate seller name
      Product.find({}).sort({ createdAt: -1 }).limit(8).populate("sellerId", "fullName"),
      Product.countDocuments(),
      Category.countDocuments(),
      Store.countDocuments(),
    ]);

    res.json({
      hero: {
        title: "Chào mừng đến với cửa hàng",
        subtitle: "Khám phá sản phẩm mới nhất hôm nay",
      },
      stats: {
        totalProducts,
        totalCategories,
        totalStores,
      },
      featuredProducts: latestProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


