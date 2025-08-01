# Hệ thống Cào Dữ liệu Doanh nghiệp ✅ HOÀN THÀNH

> **Trạng thái:** ✅ Đã triển khai thành công và hoạt động ổn định  
> **Thời gian triển khai:** 2025-08-02  
> **Kiểm thử:** Đã test tất cả API endpoints và giao diện người dùng

Đây là một ứng dụng web full-stack hiện đại được thiết kế để tự động thu thập (cào) thông tin công khai của các doanh nghiệp từ nhiều nguồn khác nhau trên internet. Hệ thống cung cấp giao diện quản trị trực quan để theo dõi, quản lý các công việc cào dữ liệu và xem kết quả thu thập được.

## 🚀 Trạng Thái Triển Khai

✅ **Backend Server:** Hoạt động tại `http://localhost:8000`  
✅ **Frontend Application:** Hoạt động tại `http://localhost:5173`  
✅ **Database:** SQLite đã được thiết lập và migrate  
✅ **Authentication:** JWT-based auth với admin user  
✅ **Real-time Updates:** Socket.IO integration  
✅ **API Endpoints:** Tất cả endpoints đã được test  

## 🎯 Các Tính năng Chính

- **📊 Dashboard:** Cung cấp cái nhìn tổng quan về số liệu thống kê quan trọng
- **⚙️ Job Management:** Tạo, theo dõi và quản lý công việc cào dữ liệu với cập nhật real-time
- **🏢 Company Database:** Quản lý dữ liệu công ty với tìm kiếm và filter nâng cao
- **🔄 Proxy Management:** Quản lý pool proxy servers với health monitoring
- **🔐 User Authentication:** Hệ thống xác thực JWT bảo mật với role-based access

---

## Công nghệ Sử dụng

- **Backend:**
  - **Node.js** & **Express.js:** Nền tảng và framework để xây dựng API.
  - **Prisma:** ORM (Object-Relational Mapping) để tương tác với cơ sở dữ liệu PostgreSQL.
  - **PostgreSQL:** Hệ quản trị cơ sở dữ liệu quan hệ.
  - **Socket.IO:** Cho phép giao tiếp hai chiều theo thời gian thực giữa client và server.
  - **Passport.js (JWT Strategy):** Middleware xác thực người dùng.
  - **Axios & Cheerio:** Thư viện để thực hiện các yêu cầu HTTP và phân tích cú pháp HTML khi cào dữ liệu.
  - **Jest & Supertest:** Framework để viết và chạy các bài kiểm tra (unit & integration tests).

- **Frontend:**
  - **React.js:** Thư viện JavaScript để xây dựng giao diện người dùng.
  - **Vite:** Công cụ build frontend thế hệ mới, cực kỳ nhanh.
  - **TypeScript:** Ngôn ngữ lập trình giúp tăng cường sự chặt chẽ và an toàn cho mã nguồn.
  - **Tailwind CSS:** Framework CSS theo hướng "utility-first" để tạo kiểu nhanh chóng.
  - **@tanstack/react-query:** Thư viện mạnh mẽ để tìm nạp, lưu vào bộ nhớ đệm và quản lý trạng thái dữ liệu từ server.

- **Môi trường & Triển khai:**
  - **Docker & Docker Compose:** Để đóng gói và chạy cơ sở dữ liệu PostgreSQL một cách nhất quán trên mọi môi trường.

---

## Sơ đồ Cấu trúc Dự án

Dự án được tổ chức theo cấu trúc monorepo, tách biệt rõ ràng giữa các thành phần.

```
enterprise-data-scraping/
├── client/                 # Chứa toàn bộ mã nguồn của Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Các thành phần UI tái sử dụng
│   │   ├── lib/            # Các module tiện ích (vd: api-client)
│   │   ├── pages/          # Các trang chính của ứng dụng (Dashboard, Login, ...)
│   │   ├── stores/         # Quản lý trạng thái (vd: auth-store với Zustand)
│   │   └── App.tsx         # Thành phần gốc và định tuyến (routing)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Chứa toàn bộ mã nguồn của Backend (Node.js + Express)
│   ├── prisma/
│   │   ├── migrations/     # Lịch sử các lần thay đổi schema cơ sở dữ liệu
│   │   └── schema.prisma   # Định nghĩa schema cho cơ sở dữ liệu
│   ├── src/
│   │   ├── api/            # Các tệp định tuyến cho từng tài nguyên (auth, jobs, ...)
│   │   ├── config/         # Các tệp cấu hình (vd: passport.ts)
│   │   ├── logic/          # Chứa logic nghiệp vụ cốt lõi (vd: scraper.ts)
│   │   ├── __tests__/      # Các tệp kiểm thử (tests)
│   │   └── index.ts        # Điểm khởi đầu của server Express
│   ├── .env                # Tệp biến môi trường (cần tạo thủ công)
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── schema.sql          # (Tùy chọn) Bản dump schema SQL ban đầu
│
├── .gitignore
├── docker-compose.yml      # Cấu hình để chạy dịch vụ PostgreSQL bằng Docker
└── README.md               # Tệp tài liệu hướng dẫn này
```

---

## Hướng dẫn Cài đặt và Chạy Dự án

Thực hiện các bước sau để cài đặt và chạy dự án trên một máy chủ hoặc máy tính mới.

### 1. Yêu cầu Tiên quyết

Đảm bảo bạn đã cài đặt các phần mềm sau trên máy của mình:
- **Git:** [https://git-scm.com/](https://git-scm.com/)
- **Node.js:** (Phiên bản 18.x trở lên) - [https://nodejs.org/](https://nodejs.org/)
- **npm:** (Thường đi kèm với Node.js)
- **Docker:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- **Docker Compose:** (Thường đi kèm với Docker Desktop)

### 2. Sao chép (Clone) Repository

```bash
git clone <URL_CUA_REPOSITORY>
cd enterprise-data-scraping
```

### 3. Cấu hình Biến Môi trường cho Backend

Bạn cần tạo một tệp `.env` trong thư mục `server/`.

```bash
cd server
touch .env
```

Sau đó, mở tệp `server/.env` và thêm vào nội dung sau. Tệp này chứa chuỗi kết nối đến cơ sở dữ liệu PostgreSQL sẽ được Docker khởi tạo.

```env
# Chuỗi kết nối đến cơ sở dữ liệu PostgreSQL
# Mật khẩu và tên người dùng phải khớp với những gì được định nghĩa trong docker-compose.yml
DATABASE_URL="postgresql://your_db_user:your_strong_password@localhost:5432/enterprise_scraping"

# (Tùy chọn) Chuỗi bí mật để ký JWT
JWT_SECRET="your_super_secret_jwt_key"
```

### 4. Cài đặt Dependencies

Bạn cần cài đặt các gói phụ thuộc cho cả `server` và `client`.

- **Cài đặt cho Server:**
  ```bash
  # Từ thư mục gốc enterprise-data-scraping/
  cd server
  npm install
  ```

- **Cài đặt cho Client:**
  ```bash
  # Từ thư mục gốc enterprise-data-scraping/
  cd ../client
  npm install
  ```

### 5. Khởi chạy Cơ sở dữ liệu

Sử dụng Docker Compose để khởi tạo và chạy container PostgreSQL trong nền.

```bash
# Từ thư mục gốc enterprise-data-scraping/
# Đảm bảo Docker đang chạy trên máy của bạn
docker-compose up -d
```

Lệnh này sẽ tải image PostgreSQL và chạy nó với các cấu hình đã được định nghĩa trong `docker-compose.yml`.

### 6. Áp dụng Database Migrations

Sau khi cơ sở dữ liệu đã chạy, bạn cần áp dụng schema để tạo các bảng cần thiết. Prisma sẽ thực hiện việc này.

```bash
# Từ thư mục gốc enterprise-data-scraping/
cd server
npx prisma migrate dev --name initial
```

Lệnh này sẽ đọc tệp `prisma/schema.prisma` và tạo các bảng tương ứng trong cơ sở dữ liệu của bạn.

### 7. Khởi chạy Ứng dụng

Bây giờ, bạn cần mở hai cửa sổ terminal riêng biệt để chạy backend và frontend.

- **Terminal 1: Chạy Backend Server**
  ```bash
  # Từ thư mục gốc enterprise-data-scraping/
  cd server
  npm run dev
  ```
  > Backend sẽ chạy tại `http://localhost:8000`.

- **Terminal 2: Chạy Frontend Client**
  ```bash
  # Từ thư mục gốc enterprise-data-scraping/
  cd client
  npm run dev
  ```
  > Frontend sẽ chạy tại `http://localhost:5173` (hoặc một cổng khác nếu 5173 đã được sử dụng).

Bây giờ bạn có thể truy cập `http://localhost:5173` trên trình duyệt để xem ứng dụng hoạt động.

---

## Các Scripts có sẵn

### Server (`server/package.json`)
- `npm run dev`: Chạy server ở chế độ phát triển với hot-reloading.
- `npm run build`: Biên dịch mã TypeScript sang JavaScript để triển khai.
- `npm test`: Chạy các bài kiểm tra bằng Jest.

### Client (`client/package.json`)
- `npm run dev`: Chạy server phát triển của Vite.
- `npm run build`: Build ứng dụng React để triển khai.
- `npm run preview`: Xem trước bản build cho production.