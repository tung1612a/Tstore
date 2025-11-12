import VietnamAddress from '../models/VietnamAddress.js';

export const getCities = async (req, res) => {
  try {
    const cities = await VietnamAddress.find({}).select('city communes').sort({ city: 1 });

    res.json({
      data: cities,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server khi lấy danh sách tỉnh/thành phố',
      error: error.message,
    });
  }
};



