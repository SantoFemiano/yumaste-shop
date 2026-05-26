import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BASE_URL = import.meta.env.VITE_API_URL;

interface RaccomandazioneResponseDTO {
    boxId: number | null;
    messaggio: string;
    nomeBox: string;
}

interface Props {
    token: string;
    onAggiungiAlCarrello: (boxId: number, nomeBox: string) => void;
}

const RaccomandazioneOrdini: React.FC<Props> = ({ token, onAggiungiAlCarrello }) => {
    const [aperto, setAperto] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [risultato, setRisultato] = useState<RaccomandazioneResponseDTO | null>(null);
    const [errore, setErrore] = useState<string | null>(null);

    const chiediRaccomandazione = async () => {
        if (risultato) {
            setAperto(prev => !prev);
            return;
        }
        setAperto(true);
        setIsLoading(true);
        setErrore(null);

        try {
            const response = await axios.get<RaccomandazioneResponseDTO>(
                `${BASE_URL}/api/ai/raccomandazione/ordini`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRisultato(response.data);
        } catch (err) {
            console.error('Errore raccomandazione:', err);
            setErrore('Non riesco a generare un consiglio al momento. Riprova tra poco!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
        >
            {/* Banner */}
            <div
                className={`bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-800 p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border-4 border-white relative overflow-hidden transition-all duration-500 ${aperto ? 'rounded-t-4xl rounded-b-none mb-0' : 'rounded-4xl'}`}
            >
                {/* Decorazione sfondo */}
                <div className="absolute -top-24 -right-24 opacity-10 rotate-12">
                    <History className="w-96 h-96" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <History className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                            Consiglio dai tuoi ordini <Sparkles className="w-6 h-6 text-yellow-400" />
                        </h3>
                        <p className="text-emerald-100 font-medium text-lg max-w-xl">
                            L'IA analizza i tuoi ordini passati e ti suggerisce la prossima box perfetta per te!
                        </p>
                    </div>
                </div>

                <Button
                    onClick={chiediRaccomandazione}
                    disabled={isLoading}
                    className="relative z-10 bg-white text-emerald-700 hover:bg-emerald-50 font-black px-10 py-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xl whitespace-nowrap w-full lg:w-auto disabled:opacity-70"
                >
                    {isLoading
                        ? <><Loader2 className="w-5 h-5 mr-2 animate-spin inline" /> Analisi in corso...</>
                        : aperto ? 'Chiudi consiglio' : 'Scopri la tua box'}
                </Button>
            </div>

            {/* Pannello risultato */}
            <AnimatePresence>
                {aperto && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden shadow-xl shadow-emerald-100/50 rounded-b-4xl border-x border-b border-emerald-100 bg-white"
                    >
                        <div className="p-8">
                            {isLoading && (
                                <div className="flex flex-col items-center gap-4 py-8 text-emerald-700">
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <p className="font-semibold text-lg">Il nostro Chef AI sta analizzando i tuoi gusti...</p>
                                </div>
                            )}

                            {errore && !isLoading && (
                                <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-2xl">
                                    <AlertCircle className="w-6 h-6 shrink-0" />
                                    <p className="font-medium">{errore}</p>
                                </div>
                            )}

                            {risultato && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col md:flex-row items-center gap-6"
                                >
                                    {/* Icona */}
                                    <div className="p-5 bg-emerald-50 rounded-3xl border-2 border-emerald-100 shrink-0">
                                        <Sparkles className="w-10 h-10 text-emerald-600" />
                                    </div>

                                    {/* Testo */}
                                    <div className="flex-grow text-center md:text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-1">
                                            Il tuo prossimo acquisto
                                        </p>
                                        <h4 className="text-2xl font-black text-foreground mb-2">
                                            {risultato.nomeBox}
                                        </h4>
                                        <p className="text-muted-foreground text-base leading-relaxed">
                                            {risultato.messaggio}
                                        </p>
                                    </div>

                                    {/* CTA */}
                                    {risultato.boxId && (
                                        <Button
                                            onClick={() => onAggiungiAlCarrello(risultato.boxId!, risultato.nomeBox)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-6 rounded-2xl shadow-lg hover:scale-105 transition-all text-lg whitespace-nowrap w-full md:w-auto"
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Aggiungila al carrello
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default RaccomandazioneOrdini;
