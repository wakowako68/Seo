import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/lib/db';
import AnalysisResult from '@/components/AnalysisResult';
import ReportBadge from '@/components/ReportBadge';
import { ShieldCheck, Calendar } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Params {
    id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const p = await params;
    const id = p?.id;

    const db = await prisma();
    const report = await db.auditReport.findUnique({
        where: { id },
    });

    if (!report) {
        return {
            title: 'Report Not Found',
        };
    }

    const host = new URL(report.url).hostname;
    const title = `SEO Audit: ${host} | Niche SEO Analyzer Pro`;
    const description = report.executiveSummary || `AI-Powered Authority Audit for ${host}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://niche-seo-analyzer.vercel.app/report/${id}`,
            images: [
                {
                    url: `/og-image.png`, // Fallback or dynamic image if available
                    width: 1200,
                    height: 630,
                    alt: `SEO Analysis for ${host}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`/og-image.png`],
        },
    };
}

interface Props {
    params: Promise<Params>;
}

export default async function ReportPage({ params }: Props) {
    noStore();
    const p = await params;
    const id = p?.id;

    let report;
    try {
        const db = await prisma();
        report = await db.auditReport.findUnique({
            where: { id },
        });
    } catch (e) {
        console.error("Database connection failed", e);
        if (!id || id === '[id]' || id === 'undefined' || process.env.NODE_ENV === 'production') {
            return <div className="min-h-screen bg-[#020617] h-screen flex items-center justify-center text-slate-500 uppercase tracking-[0.3em] text-[10px]">
                System Analytics Node Offline - Verify Connection
            </div>;
        }
        throw e;
    }

    if (!report) {
        notFound();
    }

    const analysisData = JSON.parse(report.fullAnalysis);
    const metadata = {
        title: report.title || 'Unknown Entity',
        description: report.description || '',
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] opacity-20" />
            </div>

            <nav className="relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="font-bold text-lg tracking-tight">Audit Report</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                        <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1.5" />
                            {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            ID: {id}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <header className="mb-12">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Public Verification Asset</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                        Clinical Summary for <span className="text-primary">{new URL(report.url).hostname}</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Authorized Niche SEO Intelligence Audit • 15+ Year Strategy Logic
                    </p>
                </header>

                <AnalysisResult data={analysisData} metadata={metadata} />
            </main>

            <ReportBadge />
        </div>
    );
}
