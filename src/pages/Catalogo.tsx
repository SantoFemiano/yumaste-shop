import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
    Search,
    ChefHat,
    ChevronLeft,
    ChevronRight,
    Plus,
    AlertCircle,
    UtensilsCrossed,
    BrainCircuit,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = import.meta.env.VITE_API_URL;
import Navbar from '../components/Navbar';
import type { BoxCatalogo } from '../types/BoxCatalogo';
import SmartForm from '../components/SmartForm';
import RaccomandazioneOrdini from '../components/RaccomandazioneOrdini';
import { useCart } from '../context/CartContext';

const Catalogo: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryRicerca = searchParams.get('search') || '';
    const { refreshCart, incrementaLocale } = useCart();

    const [boxes, setBoxes] = useState<BoxCatalogo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const [paginaAttuale, setPaginaAttuale] = useState(0);
    const [totalePagine, setTotalePagine] = useState(0);
    const [showAiQuiz, setShowAiQuiz] = useState(false);
    const [feedbackBoxId, setFeedbackBoxId] = useState<number | null>(null);

    const categorieLista = ['Tutte', 'Vegana', 'Carne', 'Pesce', 'Keto', 'SenzaGlutine', 'Dolci', 'Panificati', 'Giapponese', 'Coreano', 'MadeInNapoli', 'Pasta'];
    const [categoriaSelezionata, setCategoriaSelezionata] = useState<string>('Tutte');

    const scaricaCatalogo = useCallback(async (numeroPagina: number, categoria: string, search: string) => {
        setIsLoading(true);
        setErrore(null);
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            let url = `${BASE_URL}/api/public/boxes?page=${numeroPagina}&size=8`;
            if (categoria !== 'Tutte') url += `&categoria=${encodeURIComponent(categoria)}`;
            if (search.trim() !== '') url += `&search=${encodeURIComponent(search)}`;
            const response = await axios.get(url, config);
            if (response.status === 204 || !response.data) {
                setBoxes([]); setTotalePagine(0);
            } else {
                setBoxes(response.data.content || []);
                setTotalePagine(response.data.totalPages || 0);
            }
        } catch (_err) {
            setErrore('Non siamo riusciti a caricare il menu. Riprova più tardi.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        setPaginaAttuale(0);
        scaricaCatalogo(0, categoriaSelezionata, queryRicerca);
    }, [categoriaSelezionata, queryRicerca, scaricaCatalogo]);

    useEffect(() => {
        scaricaCatalogo(paginaAttuale, categoriaSelezionata, queryRicerca);
    }, [paginaAttuale, categoriaSelezionata, queryRicerca, scaricaCatalogo]);

    const aggiungiAlCarrello = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!token) { navigate('/login'); return; }
        if (feedbackBoxId === id) return;

        setFeedbackBoxId(id);
        incrementaLocale();

        try {
            await axios.post(
                `${BASE_URL}/api/user/cart/add`,
                { boxId: id, quantita: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refreshCart(token);
        } catch (_err) {
            refreshCart(token);
        } finally {
            setTimeout(() => setFeedbackBoxId(null), 1500);
        }
    };

    const aggiungiAlCarrelloDaRaccomandazione = (boxId: number) => {
        aggiungiAlCarrello(boxId);
    };

    const gridVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const cardVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Navbar token={token} setToken={setToken} />

            <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-10">

                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center md:text-left"
                >
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <ChefHat className="w-10 h-10 text-primary" />
                        <h2 className="text-4xl font-black tracking-tight uppercase">
                            {queryRicerca ? 'Risultati Ricerca' : 'Le Nostre Box'}
                        </h2>
                    </div>
                    {queryRicerca ? (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <p className="text-lg text-muted-foreground">
                                Risultati per: <span className="font-bold text-primary italic">"{queryRicerca}"</span>
                            </p>
                            <Button variant="link" onClick={() => navigate('/')} className="p-0 h-auto font-bold text-indigo-600">
                                Mostra tutto il catalogo
                            </Button>
                        </div>
                    ) : (
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Ingredienti freschi e ricette guidate per cucinare piatti straordinari a casa tua.
                        </p>
                    )}
                </motion.header>

                <div className="mb-12 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {categorieLista.map((cat) => (
                        <Button
                            key={cat}
                            variant={categoriaSelezionata === cat ? 'default' : 'secondary'}
                            onClick={() => setCategoriaSelezionata(cat)}
                            className="rounded-full font-bold px-6 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {!isLoading && !errore && !queryRicerca && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-800 p-8 text-white shadow-xl shadow-indigo-200 flex flex-col lg:flex-row items-center justify-between gap-8 border-4 border-white relative overflow-hidden transition-all duration-500 ${showAiQuiz ? 'rounded-t-4xl rounded-b-none mb-0' : 'rounded-4xl mb-12'}`}
                        >
                            <div className="absolute -top-24 -right-24 opacity-10 rotate-12">
                                <BrainCircuit className="w-96 h-96" />
                            </div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                                    <BrainCircuit className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                                        Non sai cosa scegliere? <Sparkles className="w-6 h-6 text-yellow-400" />
                                    </h3>
                                    <p className="text-indigo-100 font-medium text-lg max-w-xl">
                                        Dicci i tuoi obiettivi e le tue preferenze. Il nostro Chef AI troverà la Box perfetta!
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowAiQuiz(!showAiQuiz)}
                                className="relative z-10 bg-white text-indigo-700 hover:bg-indigo-50 font-black px-10 py-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xl whitespace-nowrap w-full lg:w-auto"
                            >
                                {showAiQuiz ? 'Chiudi Assistente' : "Chiedi all'IA"}
                            </Button>
                        </motion.div>

                        <AnimatePresence>
                            {showAiQuiz && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-12 shadow-xl shadow-indigo-100/50 rounded-b-4xl border-x border-b border-indigo-100 bg-white"
                                >
                                    <SmartForm />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {token && (
                            <RaccomandazioneOrdini
                                token={token}
                                onAggiungiAlCarrello={aggiungiAlCarrelloDaRaccomandazione}
                            />
                        )}
                    </>
                )}

                <AnimatePresence mode="wait">
                    {errore ? (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-destructive/10 border border-destructive/20 p-10 rounded-3xl text-center"
                        >
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-destructive mb-2">Qualcosa non va</h3>
                            <p className="text-destructive/80 mb-6">{errore}</p>
                            <Button onClick={() => scaricaCatalogo(paginaAttuale, categoriaSelezionata, queryRicerca)}>Riprova ora</Button>
                        </motion.div>
                    ) : isLoading ? (
                        <div key="loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col space-y-4">
                                    <Skeleton className="h-48 w-full rounded-2xl" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <div className="flex justify-between mt-auto">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : boxes.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted"
                        >
                            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Nessuna box trovata</h3>
                            <p className="text-muted-foreground mb-8">Prova a cambiare filtri o termine di ricerca.</p>
                            <Button variant="outline" onClick={() => { setCategoriaSelezionata('Tutte'); navigate('/'); }}>Torna al catalogo completo</Button>
                        </motion.div>
                    ) : (
                        <motion.div key="grid" variants={gridVariants} initial="hidden" animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {boxes.map((box) => (
                                <motion.div key={box.id} variants={cardVariants}>
                                    <Card
                                        className="h-full border-none shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer bg-card flex flex-col overflow-hidden"
                                        onClick={() => navigate(`/box/${box.id}`)}
                                    >
                                        <CardHeader className="p-0 relative overflow-hidden aspect-video bg-muted flex items-center justify-center">
                                            {box.immagineUrl ? (
                                                <img src={box.immagineUrl} alt={box.nome} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <UtensilsCrossed className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                            {box.prezzoScontato && box.prezzo && box.prezzoScontato < box.prezzo && (
                                                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-black px-3 py-1 shadow-lg">
                                                    {box.scontoApplicato || 'SALE'}
                                                </Badge>
                                            )}
                                        </CardHeader>

                                        <CardContent className="p-6 flex-grow">
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                {box.categorie?.map(c => (
                                                    <Badge key={c} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">{c}</Badge>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{box.nome}</h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{box.descrizione}</p>
                                        </CardContent>

                                        <CardFooter className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-border/50 bg-muted/5">
                                            <div className="flex flex-col pt-4">
                                                {box.prezzoScontato && box.prezzo && box.prezzoScontato < box.prezzo ? (
                                                    <>
                                                        <span className="text-xs text-muted-foreground line-through italic">€{box.prezzo.toFixed(2)}</span>
                                                        <span className="text-2xl font-black text-destructive">€{box.prezzoScontato.toFixed(2)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-black text-foreground">€{(box.prezzo || 0).toFixed(2)}</span>
                                                )}
                                            </div>

                                            <motion.div
                                                animate={feedbackBoxId === box.id ? { scale: [1, 1.25, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Button
                                                    size="icon"
                                                    className={`rounded-xl w-12 h-12 shadow-lg transition-all active:scale-90 ${
                                                        feedbackBoxId === box.id
                                                            ? 'bg-green-500 hover:bg-green-500'
                                                            : 'hover:rotate-12'
                                                    }`}
                                                    onClick={(e) => aggiungiAlCarrello(box.id, e)}
                                                    disabled={feedbackBoxId === box.id}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {feedbackBoxId === box.id ? (
                                                            <motion.div
                                                                key="check"
                                                                initial={{ scale: 0, rotate: -90 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                                <Plus className="w-6 h-6" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </Button>

                                            </motion.div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {totalePagine > 1 && (
                    <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6">
                        <Button variant="outline" disabled={paginaAttuale === 0}
                            onClick={() => { setPaginaAttuale(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-full md:w-auto rounded-full font-bold shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Precedente
                        </Button>
                        <div className="text-sm font-medium text-muted-foreground">
                            Pagina <span className="text-foreground font-black">{paginaAttuale + 1}</span> di {totalePagine}
                        </div>
                        <Button variant="outline" disabled={paginaAttuale >= totalePagine - 1}
                            onClick={() => { setPaginaAttuale(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-full md:w-auto rounded-full font-bold shadow-sm"
                        >
                            Successiva <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Catalogo;
