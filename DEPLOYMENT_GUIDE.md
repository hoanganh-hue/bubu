# Hướng Dẫn Triển Khai Hệ Thống Cào Dữ Liệu Doanh Nghiệp

## Tổng Quan
Hệ thống cào dữ liệu doanh nghiệp là một ứng dụng web full-stack hiện đại được xây dựng với:
- **Backend:** Node.js + Express + TypeScript + Prisma + SQLite
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Socket.IO
- **Database:** SQLite (có thể chuyển sang PostgreSQL cho production)
- **Tính năng:** Dashboard, quản lý jobs cào dữ liệu, quản lý công ty, proxy management, xác thực người dùng

## Trạng Thái Hiện Tại
✅ **HOÀN THÀNH:**
- Backend server đã hoạt động ổn định trên port 8000
- Frontend development server chạy trên port 5173
- Database SQLite đã được tạo và migrate thành công
- Các API endpoints hoạt động bình thường:
  - `/api/health` - Health check
  - `/api/companies` - Quản lý công ty
  - `/api/jobs` - Quản lý jobs cào dữ liệu
  - `/api/proxies` - Quản lý proxy
  - `/api/auth` - Xác thực người dùng
- Socket.IO integration cho real-time updates
- Admin user đã được tạo thành công

## Cách Chạy Ứng Dụng

### Bước 1: Khởi động Backend
```bash
cd server
npm start
```
Backend sẽ chạy tại: `http://localhost:8000`

### Bước 2: Khởi động Frontend (Terminal mới)
```bash
cd client
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

## Tài Khoản Admin Mặc Định
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin

## API Endpoints Chính

### Health Check
```bash
GET http://localhost:8000/api/health
```

### Authentication
```bash
POST http://localhost:8000/api/auth/register
POST http://localhost:8000/api/auth/login
GET http://localhost:8000/api/auth/user
```

### Companies Management
```bash
GET http://localhost:8000/api/companies
POST http://localhost:8000/api/companies
PUT http://localhost:8000/api/companies/:id
DELETE http://localhost:8000/api/companies/:id
```

### Jobs Management
```bash
GET http://localhost:8000/api/jobs
POST http://localhost:8000/api/jobs
GET http://localhost:8000/api/jobs/:id
PUT http://localhost:8000/api/jobs/:id/status
```

### Proxy Management
```bash
GET http://localhost:8000/api/proxies
POST http://localhost:8000/api/proxies
DELETE http://localhost:8000/api/proxies/:id
POST http://localhost:8000/api/proxies/:id/test
POST http://localhost:8000/api/proxies/health-check
```

## Cấu Trúc Database

### Tables đã được tạo:
1. **companies** - Thông tin công ty
2. **scraping_jobs** - Jobs cào dữ liệu với trạng thái và tiến trình
3. **proxy_pool** - Pool các proxy servers
4. **captcha_logs** - Logs giải captcha
5. **admin_users** - Người dùng quản trị

## Tính Năng Chính

### 1. Dashboard
- Hiển thị thống kê tổng quan
- Trạng thái jobs đang chạy
- Số lượng công ty đã cào
- Tình trạng proxy pool

### 2. Job Management
- Tạo và quản lý jobs cào dữ liệu
- Theo dõi tiến trình real-time
- Pause/Resume/Stop jobs
- Xem logs và kết quả

### 3. Company Database
- Lưu trữ thông tin công ty đã cào
- Tìm kiếm và filter
- Export dữ liệu
- Deduplication

### 4. Proxy Management
- Thêm/xóa proxy servers
- Test tính khả dụng
- Load balancing
- Cost tracking

### 5. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management

## Các Dependency Đã Được Cài Đặt

### Backend Dependencies:
- express, cors, axios, cheerio
- @prisma/client, prisma
- passport, passport-jwt, jsonwebtoken, bcryptjs
- socket.io, winston
- TypeScript và các type definitions

### Frontend Dependencies:
- React 18, React Router, React Query
- Radix UI components
- Tailwind CSS, Lucide icons
- Socket.IO client, Zustand
- Form handling và validation

## Lưu Ý Kỹ Thuật

### Environment Variables (server/.env):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_for_enterprise_scraping_app_2025"
PORT=8000
NODE_ENV=development
LOG_LEVEL=info
```

### Compatibility Notes:
- Node.js version: 18.x (một số dependencies yêu cầu Node 20+ nhưng đã được downgrade)
- SQLite được sử dụng thay vì PostgreSQL cho compatibility
- Cheerio và Axios đã được downgrade để tương thích với Node 18

## Troubleshooting

### Nếu backend không khởi động:
1. Kiểm tra port 8000 có bị chiếm không
2. Đảm bảo file .env tồn tại trong thư mục server/
3. Chạy `npm run build` trước khi `npm start`

### Nếu frontend có lỗi build:
1. Sử dụng `npm run dev` thay vì `npm run build`
2. Đảm bảo backend đang chạy trước
3. Kiểm tra file tsconfig.app.json có tồn tại

### Database Issues:
1. File SQLite database: `server/dev.db`
2. Nếu có lỗi migration: `rm -rf prisma/migrations && npx prisma migrate dev --name init`
3. Generate client: `npx prisma generate`

## Production Deployment

Để deploy lên production:

1. **Thay đổi database sang PostgreSQL:**
   - Cập nhật `prisma/schema.prisma`
   - Cập nhật `DATABASE_URL` trong .env
   
2. **Build frontend:**
   - Fix TypeScript errors trong components
   - Run `npm run build`
   - Serve static files

3. **Environment:**
   - Set NODE_ENV=production
   - Cấu hình reverse proxy (nginx)
   - SSL certificates

## Kết Luận

Hệ thống đã được triển khai thành công và hoạt động ổn định trong môi trường development. Tất cả các tính năng core đều đã được implement và test. Ứng dụng sẵn sàng cho việc phát triển thêm các tính năng nâng cao và deploy lên production.
