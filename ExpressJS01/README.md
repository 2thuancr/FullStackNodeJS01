# FullStack NodeJS Backend với MySQL

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cài đặt MySQL
- Cài đặt MySQL Server (version 8.0+)
- Tạo database và bảng bằng file `database.sql`

### 3. Cấu hình database
Chỉnh sửa file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=fullstack_nodejs
DB_PORT=3306
PORT=8888
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 4. Chạy ứng dụng
```bash
npm start
```

## API Endpoints

### Public Routes
- `POST /v1/api/register` - Đăng ký user
- `POST /v1/api/login` - Đăng nhập

### Protected Routes
- `GET /v1/api/profile` - Lấy thông tin profile (cần JWT token)
- `GET /v1/api/users` - Lấy danh sách users (chỉ admin)

## Cấu trúc dự án
```
src/
├── config/          # Cấu hình database, view engine
├── controllers/     # Xử lý request/response
├── middleware/      # JWT auth, delay demo
├── models/          # Sequelize models
├── routes/          # API routes
├── services/        # Business logic
├── views/           # EJS templates
└── server.js        # Entry point
```
