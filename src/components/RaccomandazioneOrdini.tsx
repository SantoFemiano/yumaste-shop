import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = import.meta.env.VITE_API_URL;

interface BoxRaccomandazione {
    id: number;
    nome: string;
    descrizione: string;
    prezzo: number;
    immagineUrl?: string;
    categorie?: string[];
}

interface Props {
    token: string;
    onAggiungiAlCarrello: (boxId: number) => void;
}

const RaccomandazioneOrdini: React.FC<Props> = ({ token, onAggiungiAlCarrello }) => {
    const [boxes, setBoxes] = useState<BoxRaccomandazione[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        const fetchRaccomandazioni = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/user/recommendations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBoxes(res.data || []);
            } catch (_err) {
                // nessuna raccomandazione disponibile
            } finally {
                setLoading(false);
            }
        };
        fetchRaccomandazioni();
    }, [token]);

    if (!loading && boxes.length === 0) return null;

    return (
        <div className="mb-12">
            <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-xl font-black">Consigliati per te</h3>
                </div>
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-40 rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {boxes.map(box => (
                                    <motion.div
                                        key={box.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
                                    >
                                        <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                                            {box.immagineUrl ? (
                                                <img src={box.immagineUrl} alt={box.nome} className="w-full h-full object-cover" />
                                            ) : (
                                                <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col gap-2 flex-grow">
                                            <p className="font-bold text-sm line-clamp-1">{box.nome}</p>
                                            <div className="flex gap-1 flex-wrap">
                                                {box.categorie?.slice(0, 2).map(c => (
                                                    <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                                                ))}
                                            </div>
                                            <div className="mt-auto flex items-center justify-between pt-2">
                                                <span className="font-black text-sm">€{box.prezzo.toFixed(2)}</span>
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 rounded-xl"
                                                    onClick={() => onAggiungiAlCarrello(box.id)}
                                                >
                                                    <ShoppingCart className="w-3 h-3 mr-1" /> Aggiungi
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RaccomandazioneOrdini;
