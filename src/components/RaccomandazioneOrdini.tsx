import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, BrainCircuit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = import.meta.env.VITE_API_URL;

interface AiRecommendationResponseDTO {
    boxId: number;
    nomeBox: string;
    messaggio: string;
}

interface Props {
    token: string;
    onAggiungiAlCarrello: (boxId: number) => void;
}

const RaccomandazioneOrdini: React.FC<Props> = ({ token, onAggiungiAlCarrello }) => {
    const [raccomandazione, setRaccomandazione] = useState<AiRecommendationResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState(false);
    const [aggiunto, setAggiunto] = useState(false);

    const fetchRaccomandazione = async () => {
        setLoading(true);
        setErrore(false);
        setAggiunto(false);
        try {
            const res = await axios.get(`${BASE_URL}/api/user/raccomandazione/ordini`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRaccomandazione(res.data);
        } catch (_err) {
            setErrore(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRaccomandazione();
    }, [token]);

    const handleAggiungi = () => {
        if (!raccomandazione) return;
        onAggiungiAlCarrello(raccomandazione.boxId);
        setAggiunto(true);
    };

    // Se ha errore (es. nessun ordine precedente) non mostrare il blocco
    if (!loading && errore) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="mb-12 rounded-3xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 shadow-sm"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-2xl">
                            <BrainCircuit className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-base text-slate-900">Chef AI consiglia</h3>
                            <p className="text-xs text-slate-500">Basato sui tuoi ordini precedenti</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchRaccomandazione}
                        disabled={loading}
                        className="rounded-full text-slate-400 hover:text-yellow-600"
                        title="Nuovo consiglio"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Contenuto */}
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-48 bg-yellow-100" />
                        <Skeleton className="h-4 w-full bg-yellow-100" />
                        <Skeleton className="h-4 w-3/4 bg-yellow-100" />
                    </div>
                ) : raccomandazione ? (
                    <motion.div
                        key={raccomandazione.boxId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
                                <span className="font-black text-slate-900 text-lg">
                                    {raccomandazione.nomeBox}
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                "{raccomandazione.messaggio}"
                            </p>
                        </div>

                        <Button
                            onClick={handleAggiungi}
                            disabled={aggiunto}
                            className={`shrink-0 rounded-2xl px-6 font-bold shadow-md transition-all ${
                                aggiunto
                                    ? 'bg-green-500 hover:bg-green-500 text-white'
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-white'
                            }`}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {aggiunto ? 'Aggiunto!' : 'Aggiungi al carrello'}
                        </Button>
                    </motion.div>
                ) : null}
            </motion.div>
        </AnimatePresence>
    );
};

export default RaccomandazioneOrdini;
