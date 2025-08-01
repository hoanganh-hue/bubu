#!/bin/bash

# Hệ thống Cào Dữ liệu Doanh nghiệp - Start Script
# Tác giả: MiniMax Agent
# Ngày: 2025-08-02

echo "🚀 Khởi động Hệ thống Cào Dữ liệu Doanh nghiệp..."
echo "=================================================="

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js 18+ trước."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Kiểm tra npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Khởi động Backend
echo ""
echo "🔧 Khởi động Backend Server..."
cd server
source .env

# Kiểm tra dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt backend dependencies..."
    npm install
fi

# Chờ PostgreSQL sẵn sàng
echo "⏳ Đang chờ PostgreSQL sẵn sàng..."
until pg_isready -h localhost -p 5432 -U your_db_user; do
  echo "PostgreSQL chưa sẵn sàng - đang đợi..."
  sleep 1
done
echo "✅ PostgreSQL đã sẵn sàng."

# Chạy Prisma Migrate
echo "🗄️ Chạy Prisma Migrate..."
npx prisma generate
npx prisma migrate deploy


# Build backend
echo "🔨 Building backend..."
npm run build

# Start backend in background
echo "▶️ Khởi động backend server..."
npm start &
BACKEND_PID=$!

# Đợi backend khởi động
sleep 5

# Kiểm tra backend health
echo "🔍 Kiểm tra backend health..."
HEALTH_CHECK=$(curl -s http://localhost:8000/api/health | grep -o '"status":"ok"' || echo "failed")

if [ "$HEALTH_CHECK" = '"status":"ok"' ]; then
    echo "✅ Backend đã khởi động thành công tại http://localhost:8000"
else
    echo "❌ Backend khởi động thất bại"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Khởi động Frontend
echo ""
echo "🎨 Khởi động Frontend Application..."
cd ../client

# Kiểm tra dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt frontend dependencies..."
    pnpm install
fi

# Kiểm tra tsconfig
if [ ! -f "tsconfig.app.json" ]; then
    echo "📋 Copy tsconfig.app.json..."
    cp ../tsconfig.app.json .
fi

# Start frontend
echo "▶️ Khởi động frontend development server..."
npm run dev &
FRONTEND_PID=$!

# Đợi frontend khởi động
sleep 8

echo ""
echo "🎉 HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG!"
echo "=================================================="
echo "📱 Frontend:  http://localhost:5173"
echo "🔧 Backend:   http://localhost:8000"
echo "📊 API Health: http://localhost:8000/api/health"
echo ""
echo "👤 Tài khoản Admin mặc định:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Nhấn Ctrl+C để dừng toàn bộ hệ thống"
echo "=================================================="

# Trap Ctrl+C để dừng cả hai services
trap 'echo ""; echo "🛑 Đang dừng hệ thống..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Giữ script chạy
wait
