"use client";

import { useState } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Rocket, Target, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnalysisResult from '@/components/AnalysisResult';

export default function Dashboard() {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [reportId, setReportId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        setReportId(null);
        setCopied(false);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to analyze URL';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch {
                    // Not JSON, use generic or status text
                    errorMessage = `Server Error (${response.status}): The clinical analytical engine is temporary offline.`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setResult(data);
            setReportId(data.reportId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyShareLink = () => {
        if (!reportId) return;
        const shareUrl = `${window.location.origin}/report/${reportId}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020617] text-white">
            {/* Background blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <header className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
                    >
                        <Sparkles className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-slate-400">Next-Gen SEO Intelligence</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
                    >
                        Niche SEO <span className="gradient-text">Analyzer Pro</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        Unlock deep AI-powered insights and authority scores for any niche.
                        Dominate your market with professional, actionable growth roadmaps.
                    </motion.p>
                </header>

                <section className="mb-12">
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleAnalyze}
                        className="max-w-3xl mx-auto relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex items-center bg-slate-900 rounded-2xl p-1 pb-1.5 pt-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <div className="pl-4">
                                <Search className="w-6 h-6 text-slate-500" />
                            </div>
                            <input
                                type="url"
                                placeholder="https://your-niche-site.com"
                                required
                                className="w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-4 placeholder:text-slate-600 outline-none"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isAnalyzing}
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mr-1"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Run Audit</span>
                                        <Rocket className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>

                    {reportId && !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex justify-center"
                        >
                            <button
                                onClick={copyShareLink}
                                className="flex items-center space-x-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-sm font-medium"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Link Copied to Clipboard</span>
                                    </>
                                ) : (
                                    <>
                                        <Target className="w-4 h-4 text-secondary" />
                                        <span>Copy Shareable Audit Link</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </section>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center justify-center space-x-3 mb-8 backdrop-blur-sm"
                    >
                        <ShieldCheck className="w-5 h-5 text-red-500/70" />
                        <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                )}

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.5 }}
                        >
                            <AnalysisResult data={result.data} metadata={result.metadata} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!result && !isAnalyzing && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
                        {[
                            { icon: BarChart3, title: 'Authority Scoring', desc: 'Proprietary AI score based on niche relevance and content depth.' },
                            { icon: Target, title: 'Growth Roadmap', desc: 'Personalized 3-step action plan for immediate SEO improvement.' },
                            { icon: ShieldCheck, title: 'Trust Indicators', desc: 'Analysis of internal structure and external authority signals.' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="glass-morphism p-6 rounded-2xl"
                            >
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-slate-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
