import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Server } from 'socket.io';
import { HttpsProxyAgent } from 'https-proxy-agent';
import logger from '../config/logger';

const prisma = new PrismaClient();
let io: Server;

export function initializeScraper(socketIo: Server) {
    io = socketIo;
}

async function updateJobStatus(jobId: string, updates: any) {
    try {
        const updatedJob = await prisma.scrapingJob.update({
            where: { job_id: jobId },
            data: { ...updates, updated_at: new Date() },
        });
        if (io) {
            io.emit('job-update', updatedJob);
        }
    } catch (error) {
        logger.error(`Failed to update job status for job ${jobId}:`, error);
    }
}

async function getRandomActiveProxy() {
    try {
        const activeProxies = await prisma.proxyServer.findMany({
            where: { status: 'active' },
        });
        
        if (activeProxies.length === 0) {
            logger.warn('No active proxies found');
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * activeProxies.length);
        return activeProxies[randomIndex];
    } catch (error) {
        logger.error('Failed to get random active proxy:', error);
        return null;
    }
}

async function saveCompaniesToDatabase(companies: any[]) {
    const batchSize = 10;
    for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        try {
            // Use upsert for each company to handle duplicates in SQLite
            for (const company of batch) {
                try {
                    await prisma.company.upsert({
                        where: { tax_code: company.tax_code },
                        update: company,
                        create: company,
                    });
                } catch (error) {
                    logger.error('Failed to save company:', company.tax_code, error);
                }
            }
        } catch (error) {
            logger.error('Failed to save company batch:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}


    async function solveCaptcha(sitekey: string, pageurl: string, captchaType: string) {
    logger.info(`Attempting to solve ${captchaType} CAPTCHA for ${pageurl} with sitekey: ${sitekey}`);
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
}
// This can be split into multiple files in a 'parsers' directory for better organization

function parseInfoDoanhNghiep(html: string): { companies: any[], nextPageUrl: string | null } {
    const $ = cheerio.load(html);
    const companies: any[] = [];

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

function parseHsctvn(html: string): { companies: any[], nextPageUrl: string | null } {
    const $ = cheerio.load(html);
    const companies: any[] = [];

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

function parseMasoThue(html: string): { companies: any[], nextPageUrl: string | null } {
    const $ = cheerio.load(html);
    const companies: any[] = [];

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

const parsers: { [key: string]: (html: string) => { companies: any[], nextPageUrl: string | null } } = {
    'infodoanhnghiep.com': parseInfoDoanhNghiep,
    'hsctvn.com': parseHsctvn,
    'masothue.com': parseMasoThue,
};

function detectCaptcha(html: string): { isDetected: boolean, sitekey: string | null, type: string | null } {
    const $ = cheerio.load(html);
    const captchaIndicators = ['recaptcha', 'hcaptcha', 'captcha', 'g-recaptcha', 'h-captcha', 'Please complete the security check'];
    const isDetected = captchaIndicators.some(indicator => html.toLowerCase().includes(indicator.toLowerCase()));

    let sitekey: string | null = null;
    let type: string | null = null;

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

async function fetchWithProxy(url: string, proxyUrl: string | null) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    const response = await axios.get(url, { headers, httpsAgent: agent, timeout: 20000 });
    return response.data;
}

function buildSearchUrl(source: string, parameters: any): string {
    const baseUrls = {
        'infodoanhnghiep.com': 'https://infodoanhnghiep.com/tim-kiem',
        'hsctvn.com': 'https://hsctvn.com/search',
        'masothue.com': 'https://masothue.com/tra-cuu'
    };
    const baseUrl = baseUrls[source as keyof typeof baseUrls];
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
        } else if (source === 'hsctvn.com') {
            url.searchParams.set('query', parameters.keyword);
        } else if (source === 'masothue.com') {
            url.searchParams.set('q', parameters.keyword);
        }
    }
    return url.toString();
}


async function scrapeFromSource(source: string, parameters: any, jobId: string) {
    const allCompanies: any[] = [];
    let cost = 0;
    let captchaCount = 0;
    let currentPageUrl: string | null = buildSearchUrl(source, parameters);

    const parser = parsers[source];
    if (!parser) {
        throw new Error(`No parser available for source: ${source}`);
    }

    while (currentPageUrl) {
        logger.info(`[Job ${jobId}] Scraping page: ${currentPageUrl}`);

        let proxyUrl: string | null = null;
        if (parameters.useProxy) {
            const proxy = await getRandomActiveProxy();
            if (proxy) {
                proxyUrl = proxy.proxy_url;
                cost += 0.001; // Placeholder cost
                logger.info(`[Job ${jobId}] Using proxy: ${proxyUrl}`);
            }
        }

        try {
            const html = await fetchWithProxy(currentPageUrl, proxyUrl);

            const { isDetected, sitekey, type } = detectCaptcha(html);
            if (isDetected) {
                logger.warn(`[Job ${jobId}] CAPTCHA detected on ${currentPageUrl}. Attempting to solve...`);
                if (sitekey && type) {
                    const captchaSolution = await solveCaptcha(sitekey, currentPageUrl, type);
                    if (captchaSolution.success) {
                        captchaCount++;
                        cost += captchaSolution.cost;
                        logger.info(`[Job ${jobId}] CAPTCHA solved. Retrying request with solution.`);
                        // Retry the request with the CAPTCHA solution
                        // This part needs to be adapted based on how the target site handles CAPTCHA solutions
                        // For reCAPTCHA, the solution is typically a token added to a form submission or a specific query parameter.
                        // For now, we'll just log and continue, assuming the next request might work or the site is too complex.
                        // A more robust solution would involve re-submitting the form or making a new request with the token.
                        // For simplicity, we'll break and let the job fail for this source if it's a hard CAPTCHA.
                        break; // For now, break after attempting to solve, as re-submission logic is complex and site-specific.
                    } else {
                        logger.error(`[Job ${jobId}] Failed to solve CAPTCHA on ${currentPageUrl}. Stopping scrape for this source.`);
                        break; // Stop for this source if CAPTCHA solving fails
                    }
                } else {
                    logger.error(`[Job ${jobId}] CAPTCHA detected but sitekey or type not found. Stopping scrape for this source.`);
                    break; // Stop if CAPTCHA details are missing
                }
            }

            const { companies, nextPageUrl } = parser(html);
            allCompanies.push(...companies);

            await updateJobStatus(jobId, {
                success_count: allCompanies.length,
                total_records: allCompanies.length,
            });

            currentPageUrl = nextPageUrl ? new URL(nextPageUrl, `https://${source}`).toString() : null;

            if (parameters.limit && allCompanies.length >= parameters.limit) {
                logger.info(`[Job ${jobId}] Reached limit of ${parameters.limit}. Stopping.`);
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between pages

        } catch (error) {
            logger.error(`[Job ${jobId}] Error scraping page ${currentPageUrl}:`, error);
            // Implement retry logic here if needed
            break; // Stop on error for this source
        }
    }

    return { companies: allCompanies, cost, captchaCount };
}


export async function startRealScrapingProcess(jobId: string, jobType: string, parameters: any) {
    try {
        await updateJobStatus(jobId, { status: 'running', progress: 0 });

        const sources = parameters.sources || ['infodoanhnghiep.com', 'hsctvn.com', 'masothue.com'];
        let allCompanies: any[] = [];
        let totalCost = 0;
        let captchaSolved = 0;

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            logger.info(`[Job ${jobId}] Starting to scrape from source: ${source}`);

            try {
                const { companies, cost, captchaCount } = await scrapeFromSource(source, parameters, jobId);
                allCompanies.push(...companies);
                totalCost += cost;
                captchaSolved += captchaCount;

                const progress = Math.floor(((i + 1) / sources.length) * 100);
                await updateJobStatus(jobId, {
                    progress: progress,
                    success_count: allCompanies.length,
                    captcha_solved: captchaSolved,
                    cost_tracking: parseFloat(totalCost.toFixed(4))
                });

            } catch (error) {
                logger.error(`[Job ${jobId}] Failed to scrape from ${source}:`, error);
                await updateJobStatus(jobId, { error_logs: [`Failed to scrape from ${source}: ${(error as Error).message}`] });
            }
        }

        if (allCompanies.length > 0) {
            logger.info(`[Job ${jobId}] Saving ${allCompanies.length} companies to database.`);
            await saveCompaniesToDatabase(allCompanies);
        }

        await updateJobStatus(jobId, {
            status: 'completed',
            progress: 100,
            completed_at: new Date(),
        });

        logger.info(`[Job ${jobId}] Scraping job completed. Found ${allCompanies.length} companies.`);

    } catch (error) {
        logger.error(`[Job ${jobId}] Scraping process failed:`, error);
        await updateJobStatus(jobId, { status: 'failed', error_logs: [(error as Error).message] });
    }
}