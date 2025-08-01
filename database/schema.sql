-- Bảng lưu trữ thông tin công ty
CREATE TABLE companies (
    tax_code VARCHAR(20) PRIMARY KEY,
    company_name TEXT NOT NULL,
    legal_representative TEXT,
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    industry_code VARCHAR(10),
    industry_name TEXT,
    charter_capital BIGINT,
    establishment_date DATE,
    business_status VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    source_website VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng quản lý các job scraping
CREATE TABLE scraping_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL,
    parameters JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
    progress REAL NOT NULL DEFAULT 0,
    total_records INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    proxy_used VARCHAR(255),
    captcha_solved INT NOT NULL DEFAULT 0,
    cost_tracking NUMERIC(10, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_logs TEXT[],
    user_id UUID
);

-- Bảng quản lý proxy
CREATE TABLE proxy_pool (
    proxy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proxy_url VARCHAR(255) NOT NULL UNIQUE,
    proxy_type VARCHAR(10) CHECK (proxy_type IN ('http', 'https', 'socks5')),
    country VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'testing' CHECK (status IN ('active', 'inactive', 'blocked', 'testing')),
    response_time INT,
    success_rate REAL NOT NULL DEFAULT 0,
    last_checked TIMESTAMPTZ,
    cost_per_request NUMERIC(10, 6) NOT NULL DEFAULT 0,
    provider VARCHAR(100),
    username VARCHAR(100),
    password VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng log giải CAPTCHA
CREATE TABLE captcha_logs (
    captcha_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    captcha_type VARCHAR(50) NOT NULL,
    image_url TEXT,
    solution TEXT,
    solver_service VARCHAR(100),
    cost NUMERIC(10, 6) NOT NULL,
    solve_time INT,
    success BOOLEAN NOT NULL,
    job_id UUID REFERENCES scraping_jobs(job_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng quản lý người dùng admin
CREATE TABLE admin_users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name TEXT,
    role VARCHAR(50) NOT NULL,
    api_key VARCHAR(255) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tạo index để tăng tốc độ truy vấn
CREATE INDEX idx_companies_province ON companies(province);
CREATE INDEX idx_companies_industry_code ON companies(industry_code);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_proxy_pool_status ON proxy_pool(status);
