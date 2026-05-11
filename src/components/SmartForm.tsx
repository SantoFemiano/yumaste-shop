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

// Interfaccia per mappare l'oggetto che arriva dal backend
interface AiResult {
    boxId: number | null;
    messaggio: string;
    nomeBox: string;
}

const SmartForm: React.FC<SmartFormProps> = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;

    const [form, setForm] = useState({
        obiettivo: 'Mangiare sano',
        tipoDieta: 'Onnivora',
        calorieGiornaliere: 2000
    });

    const [allergeniInput, setAllergeniInput] = useState<string>('');
    const [aiResult, setAiResult] = useState<AiResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const chiediAdAi = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const allergeniArray = allergeniInput
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

        const requestBody = {
            ...form,
            allergeni: allergeniArray
        };

        try {
            const response = await axios.post(`${BASE_URL}/api/public/ai/recommend`, requestBody);
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
                            <option>Dimagrimento</option>
                            <option>Massa muscolare</option>
                        </select>
                    </div>

                    {/* Tipo Dieta */}
                    <div>
                        <label className="text-sm font-bold text-slate-600 mb-1 block">Stile Alimentare</label>
                        <select
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={form.tipoDieta}
                            onChange={(e) => setForm({...form, tipoDieta: e.target.value})}
                        >
                            <option>Onnivora</option>
                            <option>Vegetariana</option>
                            <option>Vegana</option>
                        </select>
                    </div>

                    {/* Calorie */}
                    <div>
                        <label className="text-sm font-bold text-slate-600 mb-1 block">Calorie Giornaliere (kcal)</label>
                        <input
                            type="number"
                            min="1000"
                            max="5000"
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={form.calorieGiornaliere}
                            onChange={(e) => setForm({...form, calorieGiornaliere: Number(e.target.value)})}
                        />
                    </div>

                    {/* Allergeni */}
                    <div>
                        <label className="text-sm font-bold text-slate-600 mb-1 block">Allergeni da evitare</label>
                        <input
                            type="text"
                            placeholder="Es. Glutine, Lattosio (separati da virgola)"
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={allergeniInput}
                            onChange={(e) => setAllergeniInput(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full py-6 rounded-xl mt-4">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        Trova la Box ideale
                    </Button>
                </form>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-indigo-900 font-medium italic">"{aiResult.messaggio}"</p>
                    </div>

                    {/* Se l'AI ha trovato un ID valido lo manda alla Box, altrimenti fallback al Catalogo */}
                    {aiResult.boxId ? (
                        <Button
                            onClick={() => {
                                navigate(`/box/${aiResult.boxId}`);
                                if(onClose) onClose();
                            }}
                            className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                        >
                            Vai a {aiResult.nomeBox} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                navigate(`/catalogo`);
                                if(onClose) onClose();
                            }}
                            className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                        >
                            Vai a {aiResult.nomeBox} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    )}

                    <Button variant="ghost" onClick={() => setAiResult(null)} className="w-full text-slate-400">
                        Riprova il quiz
                    </Button>
                </motion.div>
            )}
        </div>
    );
};

export default SmartForm;