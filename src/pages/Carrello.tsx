import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ShoppingCart,
    MapPin,
    CreditCard,
    Trash2,
    Plus,
    Minus,
    PackageOpen,
    AlertTriangle,
    Loader2
} from 'lucide-react';

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { Carrello as CarrelloItem } from '../types/Carrello';
import Navbar from '../components/Navbar';

const Carrello: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();

    // --- STATI CARRELLO ---
    const [elementiCarrello, setElementiCarrello] = useState<CarrelloItem[]>([]);
    const [totaleBackend, setTotaleBackend] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const BASE_URL = import.meta.env.VITE_API_URL;

    // --- STATI CHECKOUT ---
    const [indirizzi, setIndirizzi] = useState<any[]>([]);
    const [indirizzoSelezionato, setIndirizzoSelezionato] = useState<number | null>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    // --- FUNZIONE PER SCARICARE I DATI ---
    const scaricaDati = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setIsLoading(true);
        setErrore(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Scarichiamo il Carrello
            const resCart = await axios.get(`${BASE_URL}/api/user/cart`, config);
            const dati = resCart.data;

            if (dati && Array.isArray(dati.items)) {
                setElementiCarrello(dati.items);
                setTotaleBackend(dati.totalPrice || 0);
            } else {
                setElementiCarrello([]);
                setTotaleBackend(0);
            }

            // 2. Scarichiamo gli Indirizzi (solo al caricamento iniziale)
            if (isInitialLoad) {
                const resInd = await axios.get('${BASE_URL}/api/user/indirizzi', config);
                setIndirizzi(resInd.data);

                if (resInd.data.length > 0) {
                    setIndirizzoSelezionato(resInd.data[0].id);
                }
            }

        } catch (error) {
            console.error("Errore API:", error);
            setErrore("Impossibile caricare i dati del carrello.");
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) scaricaDati(true);
    }, [token, scaricaDati]);

    // --- GESTIONE CARRELLO ---
    const aggiornaQuantita = async (boxId: number, nuovaQuantita: number) => {
        if (nuovaQuantita < 1) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { boxId: boxId, quantita: nuovaQuantita };
            await axios.put('${BASE_URL}/api/user/cart/update', payload, config);
            scaricaDati(false);
        } catch (error) {
            console.error("Errore aggiornamento quantità:", error);
            window.alert("Impossibile aggiornare la quantità.");
        }
    };

    const rimuoviDalCarrello = async (boxId: number) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${BASE_URL}/api/user/cart/remove/${boxId}`, config);
            scaricaDati(false);
        } catch (error) {
            console.error("Errore rimozione prodotto:", error);
            window.alert("Impossibile rimuovere il prodotto dal carrello.");
        }
    };

    // --- GESTIONE CHECKOUT ---
    const gestisciCheckout = async () => {
        if (!indirizzoSelezionato) {
            window.alert("Per favore, seleziona un indirizzo per la consegna.");
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                indirizzoId: indirizzoSelezionato,
                metodoPagamento: "CARTA_DI_CREDITO"
            };

            const response = await axios.post('${BASE_URL}/api/user/checkout', payload, config);
            window.alert(`Ordine confermato! Codice: ${response.data.codiceOrdine}`);
            navigate('/');
        } catch (error) {
            console.error("Errore durante il checkout:", error);
            window.alert("Errore nel processare l'ordine.");
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const listaSicura = Array.isArray(elementiCarrello) ? elementiCarrello : [];

    // --- RENDER STATI DI CARICAMENTO/ERRORE ---
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
            <Navbar token={token} setToken={setToken} />

            <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8 mt-4">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 hover:bg-white">
                    <ChevronLeft className="mr-2 w-4 h-4" /> Continua gli acquisti
                </Button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Il tuo Carrello</h1>
                </div>

                {errore ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-rose-200 bg-rose-50 shadow-none rounded-[2rem]">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-rose-600">
                                <AlertTriangle className="w-12 h-12 mb-4" />
                                <p className="text-lg font-bold">{errore}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : listaSicura.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-dashed border-2 border-slate-200 bg-transparent shadow-none rounded-[3rem]">
                            <CardContent className="flex flex-col items-center justify-center py-24">
                                <PackageOpen className="w-24 h-24 text-slate-300 mb-6" strokeWidth={1} />
                                <h3 className="text-2xl font-black text-slate-400 mb-8">Il tuo carrello è vuoto.</h3>
                                <Button onClick={() => navigate('/')} size="lg" className="h-14 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                    Vai al Catalogo
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* COLONNA SINISTRA: LISTA PRODOTTI */}
                        <div className="lg:col-span-7 space-y-6">
                            <AnimatePresence>
                                {listaSicura.map((item) => (
                                    <motion.div
                                        key={item.boxId}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                    >
                                        <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 overflow-hidden bg-white">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col sm:flex-row gap-6 items-center">

                                                    {/* Immagine */}
                                                    <div className="w-28 h-28 rounded-[1.5rem] bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                        {item.immagineUrl ? (
                                                            <img src={item.immagineUrl} alt={item.nomeBox} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingCart className="w-10 h-10 text-slate-300" />
                                                        )}
                                                    </div>

                                                    {/* Dettagli Box */}
                                                    <div className="flex-grow w-full space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.nomeBox}</h3>
                                                                <p className="text-sm font-medium text-slate-500 mt-1">
                                                                    €{item.prezzoScontato?.toFixed(2)} / pz
                                                                </p>
                                                            </div>
                                                            <p className="text-2xl font-black text-slate-900">
                                                                €{(item.prezzoScontato ? item.prezzoScontato * item.quantita : 0).toFixed(2)}
                                                            </p>
                                                        </div>

                                                        {/* Controlli Quantità e Rimozione */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
                                                                    onClick={() => aggiornaQuantita(item.boxId, item.quantita - 1)}
                                                                    disabled={item.quantita <= 1}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <span className="w-10 text-center font-bold">{item.quantita}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
                                                                    onClick={() => aggiornaQuantita(item.boxId, item.quantita + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold px-3"
                                                                onClick={() => rimuoviDalCarrello(item.boxId)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> Rimuovi
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* COLONNA DESTRA: INDIRIZZI E CHECKOUT */}
                        <div className="lg:col-span-5 space-y-8">

                            {/* Sezione Indirizzi */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <MapPin className="w-6 h-6 text-indigo-500" />
                                            <h3 className="text-xl font-bold text-slate-900">Spedizione</h3>
                                        </div>

                                        {indirizzi.length > 0 ? (
                                            <div className="space-y-3">
                                                {indirizzi.map((ind) => (
                                                    <div
                                                        key={ind.id}
                                                        onClick={() => setIndirizzoSelezionato(ind.id)}
                                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                            indirizzoSelezionato === ind.id
                                                                ? "border-primary bg-primary/5 shadow-sm"
                                                                : "border-slate-100 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        <p className="font-bold text-slate-900">{ind.via}, {ind.civico}</p>
                                                        <p className="text-sm text-slate-500 font-medium">{ind.cap} {ind.citta} ({ind.provincia})</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-2xl bg-orange-50 text-orange-800 text-sm font-bold border border-orange-100">
                                                Nessun indirizzo trovato. Aggiungine uno dal tuo Profilo.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Sezione Totale e Pagamento */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="text-lg font-medium text-slate-400 mb-6">Riepilogo Ordine</h3>

                                        <div className="flex justify-between items-center mb-8">
                                            <span className="text-xl font-bold">Totale</span>
                                            <span className="text-5xl font-black">€{totaleBackend.toFixed(2)}</span>
                                        </div>

                                        <Separator className="bg-slate-700/50 mb-8" />

                                        <Button
                                            onClick={gestisciCheckout}
                                            disabled={isCheckoutLoading || !indirizzoSelezionato}
                                            className="w-full h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
                                        >
                                            {isCheckoutLoading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-6 h-6 mr-3" /> Conferma e Paga
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Carrello;