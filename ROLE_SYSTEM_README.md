# Hệ thống phân quyền Tstore

## Tổng quan
Hệ thống phân quyền đã được triển khai với 3 role chính:
- **Customer**: Khách hàng thông thường
- **Seller**: Người bán hàng
- **Admin**: Quản trị viên

## Backend API

### Middleware phân quyền
- `protect`: Xác thực token JWT
- `adminOnly`: Chỉ admin mới truy cập được
- `sellerOnly`: Chỉ seller mới truy cập được
- `adminOrSeller`: Admin hoặc seller mới truy cập được

### Routes mới
- `/api/admin/*` - Các API dành cho admin
- `/api/seller/*` - Các API dành cho seller
- `/api/auth/me` - Lấy thông tin user hiện tại

## Frontend

### AuthContext
Quản lý state đăng nhập với các chức năng:
- `login(email, password)`: Đăng nhập
- `logout()`: Đăng xuất
- `isAdmin()`: Kiểm tra role admin
- `isSeller()`: Kiểm tra role seller
- `isCustomer()`: Kiểm tra role customer

### ProtectedRoute
Component bảo vệ routes với các tính năng:
- Kiểm tra xác thực
- Kiểm tra role cụ thể
- Redirect đến trang phù hợp

### Dashboards
- **Admin Dashboard** (`/admin/dashboard`): Thống kê tổng quan, quản lý users
- **Seller Dashboard** (`/seller/dashboard`): Thống kê bán hàng, quản lý sản phẩm

## Cách sử dụng

### 1. Đăng nhập
Sau khi đăng nhập thành công, hệ thống sẽ tự động redirect:
- Admin → `/admin/dashboard`
- Seller → `/seller/dashboard`
- Customer → `/` (trang chủ)

### 2. Navigation
Navbar sẽ hiển thị menu phù hợp với từng role:
- Admin: Có link đến Admin Dashboard
- Seller: Có link đến Seller Dashboard
- Customer: Chỉ có thông tin cá nhân

### 3. Bảo vệ Routes
Các routes được bảo vệ bằng ProtectedRoute:
```jsx
<Route path="/admin/dashboard" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
}></Route>
```

## Cấu trúc thư mục
```
frontend/src/
├── contexts/
│   └── AuthContext.js
├── components/
│   ├── Admin/
│   │   └── AdminDashboard.js
│   ├── Seller/
│   │   └── SellerDashboard.js
│   ├── ProtectedRoute.js
│   └── RoleRedirect.js
└── App.js
```

## Lưu ý
- Token JWT được lưu trong localStorage
- Tự động kiểm tra token khi app khởi động
- API calls sử dụng Authorization header với Bearer token
- Backend URL: `http://localhost:5000`
