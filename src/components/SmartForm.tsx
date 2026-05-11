// src/components/SmartForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SmartFormProps {
    onClose?: () => void;
}

// Rimosso "token" da qui sotto
const SmartForm: React.FC<SmartFormProps> = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;

    const [form, setForm] = useState({
        obiettivo: 'Mangiare sano',
        tipoDieta: 'Onnivora',
        allergeni: [] as string[],
        calorieGiornaliere: 2000
    });

    const [aiResult, setAiResult] = useState<{ boxId: number; messaggio: string; nomeBox: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const chiediAdAi = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Chiamata pubblica, non serve il token!
            const response = await axios.post(`${BASE_URL}/api/public/ai/recommend`, form);
            setAiResult(response.data);
        } catch (error) {
            console.error("Errore AI:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Assistente Personale Yumaste</h3>
            </div>

            {!aiResult ? (
                <form onSubmit={chiediAdAi} className="space-y-4">
                    {/* Obiettivo */}
                    <div>
                        <label className="text-sm font-bold text-slate-600 mb-1 block">Il tuo obiettivo</label>
                        <select
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={form.obiettivo}
                            onChange={(e) => setForm({...form, obiettivo: e.target.value})}
                        >
                            <option>Mangiare sano</option>
                            <option>Perdita di peso</option>
                            <option>Massa muscolare</option>
                        </select>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full py-6 rounded-xl">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        Trova la Box ideale
                    </Button>
                </form>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-indigo-900 font-medium italic">"{aiResult.messaggio}"</p>
                    </div>

                    <Button
                        onClick={() => navigate(`/box/${aiResult.boxId}`)}
                        className="w-full py-6 rounded-xl bg-indigo-600"
                    >
                        Vai a {aiResult.nomeBox} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => setAiResult(null)} className="w-full text-slate-400">
                        Riprova il quiz
                    </Button>
                </motion.div>
            )}
        </div>
    );
};

export default SmartForm;