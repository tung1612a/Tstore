import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Store from "../models/Store.js";
import Inventory from "../models/Inventory.js";

export const getHome = async (req, res) => {
  try {
    const [latestProductsRaw, totalProducts, totalCategories, totalStores] = await Promise.all([
      // Get latest products and populate seller name
      Product.find({}).sort({ createdAt: -1 }).limit(8).populate("sellerId", "fullName"),
      Product.countDocuments(),
      Category.countDocuments(),
      Store.countDocuments(),
    ]);

    // Enrich with inventory and store info
    const latestProducts = await Promise.all(
      latestProductsRaw.map(async (p) => {
        const [inventory, store] = await Promise.all([
          Inventory.findOne({ productId: p._id }),
          Store.findOne({ sellerId: p.sellerId?._id })
        ]);
        const inventoryQuantity = inventory ? inventory.quantity : 0;
        const storeInfo = store ? { storeName: store.storeName, status: store.status, bannerImageURL: store.bannerImageURL } : null;
        return { ...p.toObject(), inventoryQuantity, storeInfo };
      })
    );

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


