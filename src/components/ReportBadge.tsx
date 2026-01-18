"use client";

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ReportBadge() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-t border-white/5 bg-slate-900/50">
            <Link
                href="/"
                className="group flex flex-col items-center space-y-3 transition-all hover:scale-105"
            >
                <div className="flex items-center space-x-2 text-slate-400 font-medium text-sm">
                    <span>Analysis Delivered By</span>
                </div>
                <div className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                    <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                    <span className="text-xl font-bold tracking-tight">
                        Niche SEO <span className="gradient-text">Analyzer Pro</span>
                    </span>
                </div>
            </Link>
            <p className="mt-4 text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
                Boardroom-Grade Intelligence for Digital Growth
            </p>
        </div>
    );
}
