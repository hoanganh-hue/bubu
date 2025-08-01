-- CreateTable
CREATE TABLE "companies" (
    "tax_code" TEXT NOT NULL PRIMARY KEY,
    "company_name" TEXT NOT NULL,
    "legal_representative" TEXT,
    "address" TEXT,
    "province" TEXT,
    "district" TEXT,
    "ward" TEXT,
    "industry_code" TEXT,
    "industry_name" TEXT,
    "charter_capital" BIGINT,
    "establishment_date" DATETIME,
    "business_status" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "source_website" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "scraping_jobs" (
    "job_id" TEXT NOT NULL PRIMARY KEY,
    "job_type" TEXT NOT NULL,
    "parameters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "proxy_used" TEXT,
    "captcha_solved" INTEGER NOT NULL DEFAULT 0,
    "cost_tracking" DECIMAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    "error_logs" TEXT,
    "user_id" TEXT
);

-- CreateTable
CREATE TABLE "proxy_pool" (
    "proxy_id" TEXT NOT NULL PRIMARY KEY,
    "proxy_url" TEXT NOT NULL,
    "proxy_type" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'testing',
    "response_time" INTEGER,
    "success_rate" REAL NOT NULL DEFAULT 0,
    "last_checked" DATETIME,
    "cost_per_request" DECIMAL NOT NULL DEFAULT 0,
    "provider" TEXT,
    "username" TEXT,
    "password" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "captcha_logs" (
    "captcha_id" TEXT NOT NULL PRIMARY KEY,
    "captcha_type" TEXT NOT NULL,
    "image_url" TEXT,
    "solution" TEXT,
    "solver_service" TEXT,
    "cost" DECIMAL NOT NULL,
    "solve_time" INTEGER,
    "success" BOOLEAN NOT NULL,
    "job_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "captcha_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "scraping_jobs" ("job_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL,
    "api_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "proxy_pool_proxy_url_key" ON "proxy_pool"("proxy_url");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_api_key_key" ON "admin_users"("api_key");
