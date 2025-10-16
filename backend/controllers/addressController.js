import Address from '../models/Address.js';

// @desc    Thêm một địa chỉ mới
// @route   POST /api/address
// @access  Private (Cần đăng nhập)
export const addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, country, isDefault } = req.body;
        const userId = req.user.id; // Lấy từ middleware `protect`

        if (isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }

        const address = new Address({
            user: userId,
            fullName, phone, street, city, state, country, isDefault
        });

        const createdAddress = await address.save();
        res.status(201).json(createdAddress);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi thêm địa chỉ', error: error.message });
    }
};

// @desc    Lấy danh sách địa chỉ của người dùng
// @route   GET /api/address
// @access  Private
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách địa chỉ', error: error.message });
    }
};

// @desc    Cập nhật một địa chỉ
// @route   PUT /api/address/:id
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }
        if (address.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Không được phép' });
        }

        const { fullName, phone, street, city, state, country, isDefault } = req.body;

        if (isDefault) {
            await Address.updateMany({ user: req.user.id }, { isDefault: false });
        }

        address.fullName = fullName || address.fullName;
        address.phone = phone || address.phone;
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.country = country || address.country;
        address.isDefault = isDefault;

        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật địa chỉ', error: error.message });
    }
};