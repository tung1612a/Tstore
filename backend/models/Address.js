import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Tham chiếu đến model User
    },
    fullName: {
        type: String,
        required: [true, 'Vui lòng nhập họ và tên'],
        trim: true,
        minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
        maxlength: [30, 'Họ và tên không được vượt quá 30 ký tự'],
        validate: {
            validator: function(v) {
                return /^[a-zA-ZÀ-ỹ\s]+$/.test(v);
            },
            message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'
        }
    },
    phone: {
        type: String,
        required: [true, 'Vui lòng nhập số điện thoại'],
        trim: true,
        validate: {
            validator: function(v) {
                const cleaned = v.replace(/\s/g, '').replace(/[^\d]/g, '');
                return (cleaned.length >= 9 && cleaned.length <= 10) && cleaned.startsWith('0');
            },
            message: 'Số điện thoại phải có từ 9 đến 10 chữ số và bắt đầu bằng 0'
        }
    },
    street: {
        type: String,
        required: [true, 'Vui lòng nhập địa chỉ cụ thể'],
        trim: true,
        minlength: [5, 'Địa chỉ phải có ít nhất 5 ký tự'],
        maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
    },
    city: {
        type: String,
        required: [true, 'Vui lòng nhập thành phố']
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const Address = mongoose.model('Address', addressSchema);

// Sử dụng export default cho Model
export default Address;