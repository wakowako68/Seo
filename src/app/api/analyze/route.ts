import { NextRequest, NextResponse } from 'next/server';
import { scrapeURL } from '@/lib/scraper';
import { analyzeSEO } from '@/lib/gemini';
import prisma from '@/lib/db';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const url = body.url;

        if (!url) {
            return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
        }

        // Step 1: Scrape
        const scrapedData = await scrapeURL(url);

        // Basic validation to check if we actually got content
        if (!scrapedData.title && !scrapedData.content) {
            return NextResponse.json({
                error: 'Failed to extract useful data from the site. It may be blocking our scraper or is empty.'
            }, { status: 422 });
        }

        // Step 2: Analyze with Gemini
        let analysis;
        try {
            analysis = await analyzeSEO(scrapedData);
        } catch (aiError: any) {
            console.error('AI Analysis failed:', aiError);
            return NextResponse.json({
                error: aiError.message || 'The AI failed to process the site data. Try again in a moment.'
            }, { status: 500 });
        }

        // Step 3: Perspective - Save to DB
        let report;
        try {
            report = await prisma.auditReport.create({
                data: {
                    url: url,
                    title: scrapedData.title,
                    description: scrapedData.description,
                    authorityScore: analysis.authority_score,
                    verdict: analysis.niche_verdict,
                    executiveSummary: analysis.executive_summary,
                    fullAnalysis: JSON.stringify(analysis),
                },
            });
        } catch (dbError: any) {
            console.error('Database save failed:', dbError);
            // We still return the analysis even if DB save fails
        }

        return NextResponse.json({
            success: true,
            data: analysis,
            metadata: {
                title: scrapedData.title,
                description: scrapedData.description,
            },
            reportId: report?.id,
        });
    } catch (error: any) {
        console.error('FATAL API ERROR:', error);
        return NextResponse.json(
            { error: 'Deep analysis failed' },
            { status: 500 }
        );
    }
}
