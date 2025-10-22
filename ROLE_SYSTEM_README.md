# Hệ thống phân quyền Tstore

## Tổng quan
Hệ thống phân quyền đã được triển khai với 4 role chính:
- **Customer**: Khách hàng thông thường
- **Seller**: Người bán hàng
- **Shipper**: Người giao hàng
- **Admin**: Quản trị viên

## Backend API

### Middleware phân quyền
- `protect`: Xác thực token JWT
- `adminOnly`: Chỉ admin mới truy cập được
- `sellerOnly`: Chỉ seller mới truy cập được
- `shipperOnly`: Chỉ shipper mới truy cập được
- `adminOrSeller`: Admin hoặc seller mới truy cập được
- `adminOrShipper`: Admin hoặc shipper mới truy cập được

### Routes mới
- `/api/admin/*` - Các API dành cho admin
- `/api/seller/*` - Các API dành cho seller
- `/api/shipper/*` - Các API dành cho shipper
- `/api/auth/me` - Lấy thông tin user hiện tại

## Frontend

### AuthContext
Quản lý state đăng nhập với các chức năng:
- `login(email, password)`: Đăng nhập
- `logout()`: Đăng xuất
- `isAdmin()`: Kiểm tra role admin
- `isSeller()`: Kiểm tra role seller
- `isShipper()`: Kiểm tra role shipper
- `isCustomer()`: Kiểm tra role customer

### ProtectedRoute
Component bảo vệ routes với các tính năng:
- Kiểm tra xác thực
- Kiểm tra role cụ thể
- Redirect đến trang phù hợp

### Dashboards
- **Admin Dashboard** (`/admin/dashboard`): Thống kê tổng quan, quản lý users
- **Seller Dashboard** (`/seller/dashboard`): Thống kê bán hàng, quản lý sản phẩm
- **Shipper Dashboard** (`/shipper/dashboard`): Thống kê giao hàng, quản lý đơn hàng giao

## Cách sử dụng

### 1. Đăng nhập
Sau khi đăng nhập thành công, hệ thống sẽ tự động redirect:
- Admin → `/admin/dashboard`
- Seller → `/seller/dashboard`
- Shipper → `/shipper/dashboard`
- Customer → `/` (trang chủ)

### 2. Navigation
Navbar sẽ hiển thị menu phù hợp với từng role:
- Admin: Có link đến Admin Dashboard
- Seller: Có link đến Seller Dashboard
- Shipper: Có link đến Shipper Dashboard
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
│   ├── Shipper/
│   │   ├── ShipperHomepage.js
│   │   ├── ShipperDashboard.js
│   │   └── ShipperOrders.js
│   ├── ProtectedRoute.js
│   └── RoleRedirect.js
└── App.js
```

## Chức năng Shipper

### Quyền hạn của Shipper:
- Xem đơn hàng được assign cho mình
- Cập nhật trạng thái đơn hàng (shipped, completed)
- Xem thống kê giao hàng và thu nhập
- Quản lý thông tin tracking

### Quy trình giao hàng:
1. Admin assign đơn hàng cho shipper
2. Shipper xác nhận đã lấy hàng và cập nhật trạng thái "Đang giao"
3. Shipper giao hàng đến khách hàng
4. Shipper cập nhật trạng thái "Đã giao" khi hoàn thành

### API Endpoints cho Shipper:
- `GET /api/shipper/dashboard` - Thống kê dashboard
- `GET /api/shipper/orders` - Danh sách đơn hàng
- `GET /api/shipper/orders/:id` - Chi tiết đơn hàng
- `PUT /api/shipper/orders/:id/ship` - Cập nhật trạng thái đang giao
- `PUT /api/shipper/orders/:id/complete` - Cập nhật trạng thái đã giao

### API Endpoints cho Admin (quản lý shipper):
- `GET /api/shipper/unassigned-orders` - Đơn hàng chưa được assign
- `POST /api/shipper/assign-order` - Assign đơn hàng cho shipper
- `GET /api/shipper/all-shippers` - Danh sách tất cả shipper

## Lưu ý
- Token JWT được lưu trong localStorage
- Tự động kiểm tra token khi app khởi động
- API calls sử dụng Authorization header với Bearer token
- Backend URL: `http://localhost:5000`
- Shipper chỉ có thể xem và cập nhật đơn hàng được assign cho mình
