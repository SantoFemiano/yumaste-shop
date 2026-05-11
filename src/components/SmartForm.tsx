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

const SmartForm: React.FC<SmartFormProps> = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;

    const [form, setForm] = useState({
        obiettivo: 'Mangiare sano',
        tipoDieta: 'Onnivora',
        calorieGiornaliere: 2000
    });

    // Stato separato per gestire gli allergeni come stringa separata da virgole
    const [allergeniInput, setAllergeniInput] = useState<string>('');

    // Modificato: il backend restituisce solo una stringa, non un oggetto con boxId
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const chiediAdAi = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Convertiamo la stringa degli allergeni in un array per il DTO
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
            // Salviamo direttamente la stringa di risposta
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
                        {/* Stampiamo direttamente la stringa aiResult */}
                        <p className="text-indigo-900 font-medium italic">"{aiResult}"</p>
                    </div>

                    {/* Poiché il backend non restituisce un ID specifico della Box, rimandiamo al catalogo generale */}
                    <Button
                        onClick={() => navigate(`/catalogo`)}
                        className="w-full py-6 rounded-xl bg-indigo-600"
                    >
                        Vai al Catalogo <ArrowRight className="ml-2 w-4 h-4" />
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