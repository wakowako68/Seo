import * as cheerio from 'cheerio';

export interface SEOData {
    title: string;
    description: string;
    headings: { [key: string]: string[] };
    internalLinks: number;
    externalLinks: number;
    imageAltTags: { src: string; alt: string }[];
    content: string;
    url: string;
    loadSpeedIndicator: {
        imageCount: number;
        scriptCount: number;
        cssCount: number;
    };
    isSimulated?: boolean;
}

export async function scrapeURL(url: string): Promise<SEOData> {
    const restrictedData: SEOData = {
        title: 'Access Restricted',
        description: 'Deep crawl blocked by target security filters.',
        headings: {},
        internalLinks: 0,
        externalLinks: 0,
        imageAltTags: [],
        content: "Access restricted",
        url,
        loadSpeedIndicator: { imageCount: 0, scriptCount: 0, cssCount: 0 },
        isSimulated: true
    };

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(10000)
        });

        if (response.status === 403 || response.status === 401) {
            console.warn(`Scraper blocked (${response.status}) for ${url}. Switching to Simulated Fallback.`);
            return restrictedData;
        }

        if (!response.ok) {
            console.warn(`Scraper received status ${response.status}. Using basic fallback.`);
            return {
                ...restrictedData,
                title: 'Connection Limited',
                content: `Response status ${response.status}. Analyzing via domain intelligence.`
            };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Metadata
        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';

        // Headings - limited to 10 per level to save tokens
        const headings: { [key: string]: string[] } = {};
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((h) => {
            headings[h] = $(h).map((_, el) => $(el).text().trim()).get().slice(0, 10);
        });

        // Links
        const internalLinks: string[] = [];
        const externalLinks: string[] = [];
        const baseDomain = new URL(url).hostname;

        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;

            try {
                const linkUrl = new URL(href, url);
                if (linkUrl.hostname === baseDomain) {
                    internalLinks.push(href);
                } else if (linkUrl.hostname) {
                    externalLinks.push(href);
                }
            } catch {
                // Ignore invalid URLs
            }
        });

        // Images
        const imageAltTags = $('img').map((_, el) => ({
            src: $(el).attr('src') || '',
            alt: $(el).attr('alt') || '',
        })).get();

        // Content
        const mainContent = $('main').length ? $('main').text() :
            $('article').length ? $('article').text() :
                $('body').text();

        const cleanedContent = mainContent
            .replace(/\s\s+/g, ' ')
            .replace(/\n/g, ' ')
            .trim()
            .slice(0, 5000);

        return {
            title,
            description,
            headings,
            internalLinks: internalLinks.length,
            externalLinks: externalLinks.length,
            imageAltTags,
            content: cleanedContent,
            url,
            loadSpeedIndicator: {
                imageCount: $('img').length,
                scriptCount: $('script').length,
                cssCount: $('link[rel="stylesheet"]').length,
            },
            isSimulated: false
        };
    } catch (e) {
        console.error('Scraper fatal error, returning restrictedFallback:', e);
        return restrictedData;
    }
}
