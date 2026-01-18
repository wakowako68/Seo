"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Rocket, ShieldCheck, Download, Image as ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

interface Props {
    data: {
        authority_score: number;
        executive_summary: string;
        metrics?: {
            quality: number;
            authority: number;
            technical: number;
            structure: number;
            velocity: number;
        };
        growth_roadmap: {
            step: number;
            action: string;
            impact: 'High' | 'Med' | 'Low';
            rationale: string;
        }[];
        niche_verdict: string;
        is_simulated?: boolean;
    };
    metadata: {
        title: string;
        description: string;
    };
}

export default function AnalysisResult({ data, metadata }: Props) {
    const exportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const getColor = (score: number) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 50) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getVerdictStyles = (verdict: string) => {
        if (verdict.includes('Leader')) return 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
        if (verdict.includes('Challenger')) return 'from-primary/20 to-secondary/20 text-primary-400 border-primary-500/30';
        return 'from-red-500/20 to-amber-500/20 text-red-400 border-red-500/30';
    };

    const radarData = data.metrics ? [
        { subject: 'Quality', A: data.metrics.quality, fullMark: 100 },
        { subject: 'Authority', A: data.metrics.authority, fullMark: 100 },
        { subject: 'Technical', A: data.metrics.technical, fullMark: 100 },
        { subject: 'Structure', A: data.metrics.structure, fullMark: 100 },
        { subject: 'Velocity', A: data.metrics.velocity, fullMark: 100 },
    ] : [];

    const handleExport = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        try {
            // Wait a bit for animations to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            const dataUrl = await toPng(exportRef.current, {
                cacheBust: true,
                backgroundColor: '#020617',
                style: {
                    borderRadius: '0',
                },
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = `niche-audit-${new URL(window.location.href).pathname.split('/').pop()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center space-x-2 px-6 py-3 bg-secondary/10 border border-secondary/30 rounded-xl hover:bg-secondary/20 transition-all text-secondary font-bold text-sm disabled:opacity-50"
                >
                    {isExporting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                            <span>Generating Image...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-4 h-4" />
                            <span>Generate Social Asset</span>
                            <Download className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Export Wrapper */}
            <div ref={exportRef} className="p-8 bg-[#020617] rounded-3xl space-y-8 overflow-hidden">
                {data.is_simulated && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center space-x-3 text-amber-400">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            Note: Deep crawl restricted by target domain security. Analysis performed via competitive domain intelligence.
                        </span>
                    </div>
                )}

                {/* Top Section: Score & Verdict */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-morphism p-8 rounded-3xl border-white/5">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-12">
                            <div className="relative w-48 h-48 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[{ value: data.authority_score }, { value: 100 - data.authority_score }]}
                                            innerRadius={60}
                                            outerRadius={80}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                        >
                                            <Cell fill={getColor(data.authority_score)} />
                                            <Cell fill="#1e293b" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black">{data.authority_score}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-widest">Authority</span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-4">
                                    <h2 className="text-3xl font-bold">Executive Summary</h2>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getVerdictStyles(data.niche_verdict)}`}>
                                        {data.niche_verdict}
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-lg mb-6 italic">
                                    "{data.executive_summary}"
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Entity Under Audit</span>
                                        <span className="font-medium truncate block">{metadata.title || 'Unknown Entity'}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Persona Context</span>
                                        <span className="font-medium flex items-center text-primary">
                                            <ShieldCheck className="w-4 h-4 mr-1" />
                                            Boardroom Analytics
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-morphism p-8 rounded-3xl flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 border-primary/20">
                        {data.metrics ? (
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                        <Radar
                                            name="Score"
                                            dataKey="A"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.6}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Audit Verdict</h3>
                                <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
                                    {data.niche_verdict}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Corporate Footer Branding for Export */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5 opacity-50 text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">
                    <div>Authorized by Niche SEO Analyzer Pro</div>
                    <div>Clinical Data Node: {new Date().toISOString().split('T')[0]}</div>
                </div>
            </div>

            {/* Roadmap Section (Not in export unless desired, usually better to keep image focused) */}
            <div className="glass-morphism p-8 rounded-3xl border-secondary/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-secondary/20 rounded-lg">
                            <Rocket className="w-6 h-6 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold">Boardroom-Grade Growth Roadmap</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                        3 High-Stakes Actions
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.growth_roadmap.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative p-6 bg-slate-900/50 rounded-2xl border border-white/5 group hover:border-secondary/50 transition-all flex flex-col"
                        >
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-secondary/20">
                                {item.step}
                            </div>
                            <div className={`text-[10px] font-black uppercase mb-3 px-2 py-0.5 rounded tracking-tighter inline-block w-fit ${item.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                                item.impact === 'Med' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                {item.impact} IMPACT
                            </div>
                            <h3 className="text-lg font-bold mb-3 group-hover:text-secondary transition-colors leading-tight">{item.action}</h3>
                            <p className="text-sm text-slate-400 mb-4 flex-grow italic line-clamp-4">
                                <span className="text-slate-600 font-bold not-italic mr-1">Rationale:</span>
                                {item.rationale}
                            </p>
                            <div className="pt-4 border-t border-white/5 flex justify-end">
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-secondary transition-all" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
