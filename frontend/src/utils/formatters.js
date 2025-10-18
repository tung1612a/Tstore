export const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0 ₫';
  
  return price.toLocaleString("vi-VN", { 
    style: "currency", 
    currency: "VND" 
  });
};
