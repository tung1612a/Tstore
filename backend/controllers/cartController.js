import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

// Helper function to get stock for a product
const getProductStock = async (productId) => {
  const product = await Product.findById(productId).select('stock');
  return product?.stock ?? 0;
};

// Helper function to get product with stock and maxPurchaseQuantity
const getProductInfo = async (productId) => {
  const product = await Product.findById(productId).select('stock maxPurchaseQuantity');
  return {
    stock: product?.stock ?? 0,
    maxPurchaseQuantity: product?.maxPurchaseQuantity ?? null
  };
};

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          select: 'title price image imageURL sellerId stock maxPurchaseQuantity',
          populate: { path: 'sellerId', select: 'fullName' }
        }
      });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Format items từ CartItem và thêm stock information
    const formattedItems = await Promise.all(
      cart.items
        .filter(ci => ci?.productId)
        .map(async (ci) => {
          const productInfo = await getProductInfo(ci.productId._id);
          return {
            _id: ci.productId._id,
            title: ci.productId.title,
            price: ci.productId.price,
            image: ci.productId.image,
            imageURL: ci.productId.imageURL,
            quantity: ci.quantity,
            stock: productInfo.stock,
            maxPurchaseQuantity: productInfo.maxPurchaseQuantity,
            sellerId: ci.productId.sellerId,
            addedAt: ci.createdAt
          };
        })
    );

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng' });
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra stock và maxPurchaseQuantity
    const productInfo = await getProductInfo(productId);
    const availableStock = productInfo.stock;
    const maxPurchaseQuantity = productInfo.maxPurchaseQuantity;
    
    if (availableStock <= 0) {
      return res.status(400).json({ message: 'Sản phẩm đã hết hàng' });
    }

    // Tìm/Tạo giỏ hàng của user
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Tìm CartItem hiện có
    let cartItem = await CartItem.findOne({ cartId: cart._id, productId });
    const newQuantity = cartItem ? cartItem.quantity + quantity : quantity;
    
    // Kiểm tra xem tổng số lượng có vượt quá stock không
    if (newQuantity > availableStock) {
      return res.status(400).json({ 
        message: `Chỉ còn ${availableStock} sản phẩm trong kho. Bạn đã có ${cartItem?.quantity || 0} sản phẩm trong giỏ hàng.` 
      });
    }

    // Kiểm tra maxPurchaseQuantity nếu có
    if (maxPurchaseQuantity !== null && newQuantity > maxPurchaseQuantity) {
      return res.status(400).json({ 
        message: `Số lượng mua tối đa cho sản phẩm này là ${maxPurchaseQuantity} sản phẩm/đơn hàng. Bạn đã có ${cartItem?.quantity || 0} sản phẩm trong giỏ hàng.` 
      });
    }

    if (cartItem) {
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cartId: cart._id, productId, quantity });
      cart.items.push(cartItem._id);
      await cart.save();
    }

    // Trả về giỏ hàng đã populate với stock
    const populated = await Cart.findById(cart._id)
      .populate({
        path: 'items',
        populate: { path: 'productId', select: 'title price image imageURL sellerId stock maxPurchaseQuantity', populate: { path: 'sellerId', select: 'fullName' } }
      });

    const formattedItems = await Promise.all(
      populated.items
        .filter(ci => ci?.productId)
        .map(async (ci) => {
          const productInfo = await getProductInfo(ci.productId._id);
          return {
            _id: ci.productId._id,
            title: ci.productId.title,
            price: ci.productId.price,
            image: ci.productId.image,
            imageURL: ci.productId.imageURL,
            quantity: ci.quantity,
            stock: productInfo.stock,
            maxPurchaseQuantity: productInfo.maxPurchaseQuantity,
            sellerId: ci.productId.sellerId,
            addedAt: ci.createdAt
          };
        })
    );

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng' });
  }
};

// Cập nhật số lượng sản phẩm
export const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Số lượng không hợp lệ' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    const cartItem = await CartItem.findOne({ cartId: cart._id, productId });
    if (!cartItem) {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }

    if (quantity === 0) {
      // Xóa cart item và bỏ khỏi cart.items
      await CartItem.deleteOne({ _id: cartItem._id });
      cart.items = cart.items.filter(id => id.toString() !== cartItem._id.toString());
      await cart.save();
    } else {
      // Kiểm tra stock và maxPurchaseQuantity trước khi cập nhật
      const productInfo = await getProductInfo(productId);
      const availableStock = productInfo.stock;
      const maxPurchaseQuantity = productInfo.maxPurchaseQuantity;
      
      if (quantity > availableStock) {
        return res.status(400).json({ 
          message: `Chỉ còn ${availableStock} sản phẩm trong kho` 
        });
      }

      // Kiểm tra maxPurchaseQuantity nếu có
      if (maxPurchaseQuantity !== null && quantity > maxPurchaseQuantity) {
        return res.status(400).json({ 
          message: `Số lượng mua tối đa cho sản phẩm này là ${maxPurchaseQuantity} sản phẩm/đơn hàng` 
        });
      }
      
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    const populated = await Cart.findById(cart._id)
      .populate({
        path: 'items',
        populate: { path: 'productId', select: 'title price image imageURL sellerId stock maxPurchaseQuantity', populate: { path: 'sellerId', select: 'fullName' } }
      });

    const formattedItems = await Promise.all(
      populated.items
        .filter(ci => ci?.productId)
        .map(async (ci) => {
          const productInfo = await getProductInfo(ci.productId._id);
          return {
            _id: ci.productId._id,
            title: ci.productId.title,
            price: ci.productId.price,
            image: ci.productId.image,
            imageURL: ci.productId.imageURL,
            quantity: ci.quantity,
            stock: productInfo.stock,
            maxPurchaseQuantity: productInfo.maxPurchaseQuantity,
            sellerId: ci.productId.sellerId,
            addedAt: ci.createdAt
          };
        })
    );

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật số lượng' });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    const cartItem = await CartItem.findOne({ cartId: cart._id, productId });
    if (cartItem) {
      await CartItem.deleteOne({ _id: cartItem._id });
      cart.items = cart.items.filter(id => id.toString() !== cartItem._id.toString());
      await cart.save();
    }

    const populated = await Cart.findById(cart._id)
      .populate({
        path: 'items',
        populate: { path: 'productId', select: 'title price image imageURL sellerId stock maxPurchaseQuantity', populate: { path: 'sellerId', select: 'fullName' } }
      });

    const formattedItems = await Promise.all(
      populated.items
        .filter(ci => ci?.productId)
        .map(async (ci) => {
          const productInfo = await getProductInfo(ci.productId._id);
          return {
            _id: ci.productId._id,
            title: ci.productId.title,
            price: ci.productId.price,
            image: ci.productId.image,
            imageURL: ci.productId.imageURL,
            quantity: ci.quantity,
            stock: productInfo.stock,
            maxPurchaseQuantity: productInfo.maxPurchaseQuantity,
            sellerId: ci.productId.sellerId,
            addedAt: ci.createdAt
          };
        })
    );

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa khỏi giỏ hàng' });
  }
};

// Xóa tất cả sản phẩm khỏi giỏ hàng
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.json({ items: [] });
    }

    // Xóa tất cả CartItem liên quan và làm rỗng cart.items
    await CartItem.deleteMany({ cartId: cart._id });
    cart.items = [];
    await cart.save();

    res.json({ items: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa giỏ hàng' });
  }
};








