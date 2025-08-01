"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeScraper = initializeScraper;
exports.startRealScrapingProcess = startRealScrapingProcess;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const https_proxy_agent_1 = require("https-proxy-agent");
const logger_1 = __importDefault(require("../config/logger"));
const prisma = new client_1.PrismaClient();
let io;
function initializeScraper(socketIo) {
    io = socketIo;
}
function updateJobStatus(jobId, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedJob = yield prisma.scrapingJob.update({
                where: { job_id: jobId },
                data: Object.assign(Object.assign({}, updates), { updated_at: new Date() }),
            });
            if (io) {
                io.emit('job-update', updatedJob);
            }
        }
        catch (error) {
            logger_1.default.error(`Failed to update job status for job ${jobId}:`, error);
        }
    });
}
function getRandomActiveProxy() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const activeProxies = yield prisma.proxyServer.findMany({
                where: { status: 'active' },
            });
            if (activeProxies.length === 0) {
                logger_1.default.warn('No active proxies found');
                return null;
            }
            const randomIndex = Math.floor(Math.random() * activeProxies.length);
            return activeProxies[randomIndex];
        }
        catch (error) {
            logger_1.default.error('Failed to get random active proxy:', error);
            return null;
        }
    });
}
function saveCompaniesToDatabase(companies) {
    return __awaiter(this, void 0, void 0, function* () {
        const batchSize = 10;
        for (let i = 0; i < companies.length; i += batchSize) {
            const batch = companies.slice(i, i + batchSize);
            try {
                // Use upsert for each company to handle duplicates in SQLite
                for (const company of batch) {
                    try {
                        yield prisma.company.upsert({
                            where: { tax_code: company.tax_code },
                            update: company,
                            create: company,
                        });
                    }
                    catch (error) {
                        logger_1.default.error('Failed to save company:', company.tax_code, error);
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Failed to save company batch:', error);
            }
            yield new Promise(resolve => setTimeout(resolve, 100));
        }
    });
}
function solveCaptcha(sitekey, pageurl, captchaType) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Attempting to solve ${captchaType} CAPTCHA for ${pageurl} with sitekey: ${sitekey}`);
        // --- HƯỚNG DẪN TÍCH HỢP DỊCH VỤ GIẢI CAPTCHA THỰC TẾ ---
        // 1. Chọn một dịch vụ giải CAPTCHA (ví dụ: 2Captcha, Anti-Captcha, CapMonster).
        // 2. Đăng ký tài khoản và lấy API Key.
        // 3. Cài đặt thư viện Node.js tương ứng của dịch vụ đó (ví dụ: `npm install @2captcha/captcha-solver`).
        // 4. Thay thế logic placeholder dưới đây bằng lời gọi API thực tế đến dịch vụ.
        //    Bạn sẽ cần sử dụng `sitekey` và `pageurl` được truyền vào.
        //    Ví dụ với 2Captcha (reCAPTCHA v2):
        //    const solver = new TwoCaptcha(process.env.TWOCAPTCHA_API_KEY);
        //    try {
        //        const res = await solver.recaptcha({ sitekey: sitekey, pageurl: pageurl });
        //        logger.info(`CAPTCHA solved: ${res.data}`);
        //        return { success: true, solution: res.data, cost: res.cost };
        //    } catch (error) {
        //        logger.error("Failed to solve CAPTCHA:", error);
        //        return { success: false, solution: null, cost: 0 };
        //    }
        // ---------------------------------------------------------
        return { success: false, solution: null, cost: 0 }; // Placeholder: CAPTCHA not solved
    });
}
// This can be split into multiple files in a 'parsers' directory for better organization
function parseInfoDoanhNghiep(html) {
    const $ = cheerio.load(html);
    const companies = [];
    $('.company-item').each((_i, element) => {
        const name = $(element).find('h3').text().trim();
        const taxCode = $(element).find('p:contains("MST")').text().replace('MST:', '').trim();
        const address = $(element).find('p:contains("Địa chỉ")').text().replace('Địa chỉ:', '').trim();
        if (name && taxCode) {
            companies.push({
                tax_code: taxCode.replace(/\-/g, ''),
                company_name: name,
                address: address,
                source_website: 'infodoanhnghiep.com',
            });
        }
    });
    const nextPageUrl = $('.pagination a.next').attr('href') || null;
    return { companies, nextPageUrl };
}
function parseHsctvn(html) {
    const $ = cheerio.load(html);
    const companies = [];
    // Assuming a structure like: <div class="company-result">...</div>
    $('.company-result').each((_i, element) => {
        const name = $(element).find('.company-name').text().trim();
        const taxCode = $(element).find('.tax-code').text().replace('Mã số thuế:', '').trim();
        const address = $(element).find('.address').text().trim();
        if (name && taxCode) {
            companies.push({
                tax_code: taxCode.replace(/\-/g, ''),
                company_name: name,
                address: address,
                source_website: 'hsctvn.com',
            });
        }
    });
    // Assuming pagination links have a class 'next-page'
    const nextPageUrl = $('.pagination .next-page').attr('href') || null;
    return { companies, nextPageUrl };
}
function parseMasoThue(html) {
    const $ = cheerio.load(html);
    const companies = [];
    // Assuming a structure like: <li class="company-item">...</li>
    $('.company-item').each((_i, element) => {
        const name = $(element).find('.company-title').text().trim();
        const taxCode = $(element).find('.tax-code-info').text().replace('MST:', '').trim();
        const address = $(element).find('.company-address').text().trim();
        if (name && taxCode) {
            companies.push({
                tax_code: taxCode.replace(/\-/g, ''),
                company_name: name,
                address: address,
                source_website: 'masothue.com',
            });
        }
    });
    // Assuming pagination links have an ID 'nextPage'
    const nextPageUrl = $('#nextPage').attr('href') || null;
    return { companies, nextPageUrl };
}
const parsers = {
    'infodoanhnghiep.com': parseInfoDoanhNghiep,
    'hsctvn.com': parseHsctvn,
    'masothue.com': parseMasoThue,
};
function detectCaptcha(html) {
    const $ = cheerio.load(html);
    const captchaIndicators = ['recaptcha', 'hcaptcha', 'captcha', 'g-recaptcha', 'h-captcha', 'Please complete the security check'];
    const isDetected = captchaIndicators.some(indicator => html.toLowerCase().includes(indicator.toLowerCase()));
    let sitekey = null;
    let type = null;
    // Try to find reCAPTCHA sitekey
    const recaptchaDiv = $('.g-recaptcha');
    if (recaptchaDiv.length > 0) {
        sitekey = recaptchaDiv.attr('data-sitekey') || null;
        type = 'reCAPTCHA';
    }
    // Try to find hCaptcha sitekey
    const hcaptchaDiv = $('.h-captcha');
    if (hcaptchaDiv.length > 0) {
        sitekey = hcaptchaDiv.attr('data-sitekey') || null;
        type = 'hCaptcha';
    }
    return { isDetected, sitekey, type };
}
function fetchWithProxy(url, proxyUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        const agent = proxyUrl ? new https_proxy_agent_1.HttpsProxyAgent(proxyUrl) : undefined;
        const response = yield axios_1.default.get(url, { headers, httpsAgent: agent, timeout: 20000 });
        return response.data;
    });
}
function buildSearchUrl(source, parameters) {
    const baseUrls = {
        'infodoanhnghiep.com': 'https://infodoanhnghiep.com/tim-kiem',
        'hsctvn.com': 'https://hsctvn.com/search',
        'masothue.com': 'https://masothue.com/tra-cuu'
    };
    const baseUrl = baseUrls[source];
    if (!baseUrl) {
        throw new Error(`Unsupported source: ${source}`);
    }
    const url = new URL(baseUrl);
    if (parameters.province) {
        url.searchParams.set('province', parameters.province);
    }
    if (parameters.industryCode) {
        url.searchParams.set('industry', parameters.industryCode);
    }
    if (parameters.keyword) {
        // Each site might have a different parameter for keyword search
        if (source === 'infodoanhnghiep.com') {
            url.searchParams.set('q', parameters.keyword);
        }
        else if (source === 'hsctvn.com') {
            url.searchParams.set('query', parameters.keyword);
        }
        else if (source === 'masothue.com') {
            url.searchParams.set('q', parameters.keyword);
        }
    }
    return url.toString();
}
function scrapeFromSource(source, parameters, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const allCompanies = [];
        let cost = 0;
        let captchaCount = 0;
        let currentPageUrl = buildSearchUrl(source, parameters);
        const parser = parsers[source];
        if (!parser) {
            throw new Error(`No parser available for source: ${source}`);
        }
        while (currentPageUrl) {
            logger_1.default.info(`[Job ${jobId}] Scraping page: ${currentPageUrl}`);
            let proxyUrl = null;
            if (parameters.useProxy) {
                const proxy = yield getRandomActiveProxy();
                if (proxy) {
                    proxyUrl = proxy.proxy_url;
                    cost += 0.001; // Placeholder cost
                    logger_1.default.info(`[Job ${jobId}] Using proxy: ${proxyUrl}`);
                }
            }
            try {
                const html = yield fetchWithProxy(currentPageUrl, proxyUrl);
                const { isDetected, sitekey, type } = detectCaptcha(html);
                if (isDetected) {
                    logger_1.default.warn(`[Job ${jobId}] CAPTCHA detected on ${currentPageUrl}. Attempting to solve...`);
                    if (sitekey && type) {
                        const captchaSolution = yield solveCaptcha(sitekey, currentPageUrl, type);
                        if (captchaSolution.success) {
                            captchaCount++;
                            cost += captchaSolution.cost;
                            logger_1.default.info(`[Job ${jobId}] CAPTCHA solved. Retrying request with solution.`);
                            // Retry the request with the CAPTCHA solution
                            // This part needs to be adapted based on how the target site handles CAPTCHA solutions
                            // For reCAPTCHA, the solution is typically a token added to a form submission or a specific query parameter.
                            // For now, we'll just log and continue, assuming the next request might work or the site is too complex.
                            // A more robust solution would involve re-submitting the form or making a new request with the token.
                            // For simplicity, we'll break and let the job fail for this source if it's a hard CAPTCHA.
                            break; // For now, break after attempting to solve, as re-submission logic is complex and site-specific.
                        }
                        else {
                            logger_1.default.error(`[Job ${jobId}] Failed to solve CAPTCHA on ${currentPageUrl}. Stopping scrape for this source.`);
                            break; // Stop for this source if CAPTCHA solving fails
                        }
                    }
                    else {
                        logger_1.default.error(`[Job ${jobId}] CAPTCHA detected but sitekey or type not found. Stopping scrape for this source.`);
                        break; // Stop if CAPTCHA details are missing
                    }
                }
                const { companies, nextPageUrl } = parser(html);
                allCompanies.push(...companies);
                yield updateJobStatus(jobId, {
                    success_count: allCompanies.length,
                    total_records: allCompanies.length,
                });
                currentPageUrl = nextPageUrl ? new URL(nextPageUrl, `https://${source}`).toString() : null;
                if (parameters.limit && allCompanies.length >= parameters.limit) {
                    logger_1.default.info(`[Job ${jobId}] Reached limit of ${parameters.limit}. Stopping.`);
                    break;
                }
                yield new Promise(resolve => setTimeout(resolve, 2000)); // Delay between pages
            }
            catch (error) {
                logger_1.default.error(`[Job ${jobId}] Error scraping page ${currentPageUrl}:`, error);
                // Implement retry logic here if needed
                break; // Stop on error for this source
            }
        }
        return { companies: allCompanies, cost, captchaCount };
    });
}
function startRealScrapingProcess(jobId, jobType, parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield updateJobStatus(jobId, { status: 'running', progress: 0 });
            const sources = parameters.sources || ['infodoanhnghiep.com', 'hsctvn.com', 'masothue.com'];
            let allCompanies = [];
            let totalCost = 0;
            let captchaSolved = 0;
            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];
                logger_1.default.info(`[Job ${jobId}] Starting to scrape from source: ${source}`);
                try {
                    const { companies, cost, captchaCount } = yield scrapeFromSource(source, parameters, jobId);
                    allCompanies.push(...companies);
                    totalCost += cost;
                    captchaSolved += captchaCount;
                    const progress = Math.floor(((i + 1) / sources.length) * 100);
                    yield updateJobStatus(jobId, {
                        progress: progress,
                        success_count: allCompanies.length,
                        captcha_solved: captchaSolved,
                        cost_tracking: parseFloat(totalCost.toFixed(4))
                    });
                }
                catch (error) {
                    logger_1.default.error(`[Job ${jobId}] Failed to scrape from ${source}:`, error);
                    yield updateJobStatus(jobId, { error_logs: [`Failed to scrape from ${source}: ${error.message}`] });
                }
            }
            if (allCompanies.length > 0) {
                logger_1.default.info(`[Job ${jobId}] Saving ${allCompanies.length} companies to database.`);
                yield saveCompaniesToDatabase(allCompanies);
            }
            yield updateJobStatus(jobId, {
                status: 'completed',
                progress: 100,
                completed_at: new Date(),
            });
            logger_1.default.info(`[Job ${jobId}] Scraping job completed. Found ${allCompanies.length} companies.`);
        }
        catch (error) {
            logger_1.default.error(`[Job ${jobId}] Scraping process failed:`, error);
            yield updateJobStatus(jobId, { status: 'failed', error_logs: [error.message] });
        }
    });
}
