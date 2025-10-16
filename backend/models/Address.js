import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Tham chiếu đến model User
    },
    fullName: {
        type: String,
        required: [true, 'Vui lòng nhập họ và tên']
    },
    phone: {
        type: String,
        required: [true, 'Vui lòng nhập số điện thoại']
    },
    street: {
        type: String,
        required: [true, 'Vui lòng nhập địa chỉ cụ thể']
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