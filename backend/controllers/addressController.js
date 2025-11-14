import Address from '../models/Address.js';

// Validate họ tên
const validateFullName = (fullName) => {
    if (!fullName || !fullName.trim()) {
        return 'Vui lòng nhập họ và tên';
    }
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
        return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    if (trimmed.length > 30) {
        return 'Họ và tên không được vượt quá 30 ký tự';
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(trimmed)) {
        return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }
    return null;
};

// Validate số điện thoại
const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
        return 'Vui lòng nhập số điện thoại';
    }
    const cleanedPhone = phone.trim().replace(/\s/g, '').replace(/[^\d]/g, '');
    
    if (cleanedPhone.length < 9 || cleanedPhone.length > 10) {
        return 'Số điện thoại phải có từ 9 đến 10 chữ số';
    }
    if (!cleanedPhone.startsWith('0')) {
        return 'Số điện thoại phải bắt đầu bằng 0';
    }
    
    return null;
};

// Validate địa chỉ cụ thể
const validateStreet = (street) => {
    if (!street || !street.trim()) {
        return 'Vui lòng nhập địa chỉ cụ thể';
    }
    const trimmed = street.trim();
    if (trimmed.length < 5) {
        return 'Địa chỉ phải có ít nhất 5 ký tự';
    }
    if (trimmed.length > 200) {
        return 'Địa chỉ không được vượt quá 200 ký tự';
    }
    return null;
};

// @desc    Thêm một địa chỉ mới
// @route   POST /api/address
// @access  Private (Cần đăng nhập)
export const addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, country, isDefault } = req.body;
        const userId = req.user.id; // Lấy từ middleware `protect`

        // Validate dữ liệu
        const fullNameError = validateFullName(fullName);
        if (fullNameError) {
            return res.status(400).json({ message: fullNameError });
        }

        const phoneError = validatePhone(phone);
        if (phoneError) {
            return res.status(400).json({ message: phoneError });
        }

        const streetError = validateStreet(street);
        if (streetError) {
            return res.status(400).json({ message: streetError });
        }

        // Chuẩn hóa số điện thoại
        const cleanedPhone = phone.trim().replace(/\s/g, '').replace(/[^\d]/g, '');

        if (isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }

        const address = new Address({
            user: userId,
            fullName: fullName.trim(),
            phone: cleanedPhone,
            street: street.trim(),
            city, state, country, isDefault
        });

        const createdAddress = await address.save();
        res.status(201).json(createdAddress);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
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
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        }

        // Kiểm tra xem địa chỉ này có thuộc về user hiện tại không
        if (address.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Không được phép xóa địa chỉ này" });
        }

        await Address.findByIdAndDelete(req.params.id);
        res.json({ message: "Xóa địa chỉ thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa địa chỉ", error: error.message });
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

        // Validate dữ liệu nếu có thay đổi
        if (fullName !== undefined) {
            const fullNameError = validateFullName(fullName);
            if (fullNameError) {
                return res.status(400).json({ message: fullNameError });
            }
        }

        if (phone !== undefined) {
            const phoneError = validatePhone(phone);
            if (phoneError) {
                return res.status(400).json({ message: phoneError });
            }
        }

        if (street !== undefined) {
            const streetError = validateStreet(street);
            if (streetError) {
                return res.status(400).json({ message: streetError });
            }
        }

        if (isDefault) {
            await Address.updateMany({ user: req.user.id }, { isDefault: false });
        }

        // Chuẩn hóa dữ liệu trước khi cập nhật
        if (fullName !== undefined) {
            address.fullName = fullName.trim();
        }
        if (phone !== undefined) {
            const cleanedPhone = phone.trim().replace(/\s/g, '').replace(/[^\d]/g, '');
            address.phone = cleanedPhone;
        }
        if (street !== undefined) {
            address.street = street.trim();
        }
        if (city !== undefined) {
            address.city = city;
        }
        if (state !== undefined) {
            address.state = state;
        }
        if (country !== undefined) {
            address.country = country;
        }
        if (isDefault !== undefined) {
            address.isDefault = isDefault;
        }

        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Lỗi server khi cập nhật địa chỉ', error: error.message });
    }
};




