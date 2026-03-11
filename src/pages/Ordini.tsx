import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Package,
    Calendar,
    Truck,
    CreditCard,
    MapPin,
    ChevronDown,
    Box as BoxIcon,
    History,
    Loader2
} from 'lucide-react';

// Shadcn UI (Simulated/Standard tailwind)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import Navbar from '../components/Navbar';

// --- INTERFACCE ---
interface Ordine {
    id: number;
    codiceOrdine: string;
    dataOrdine: string;
    totalePrezzo: number;
    statoOrdine: string;
    statoSpedizione: string;
}

interface IndirizzoResponseDTO {
    via: string;
    civico: string;
    cap: string;
    citta: string;
    provincia: string;
}

interface OrdiniDettagliDTO {
    ordineid: number;
    boxid: number;
    quantita: number;
    prezzounitario: number;
    metodopagamento: string;
    datapagamento: string;
    importo: number;
    corriere: string;
    statospedizione: string;
    indirizzoresponsedto: IndirizzoResponseDTO;
}

const Ordini: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();

    const [ordini, setOrdini] = useState<Ordine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ordineEspanso, setOrdineEspanso] = useState<number | null>(null);
    const [dettagliOrdine, setDettagliOrdine] = useState<OrdiniDettagliDTO[]>([]);
    const [isLoadingDettagli, setIsLoadingDettagli] = useState(false);

    useEffect(() => {
        const scaricaOrdini = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get('http://localhost:8084/api/user/ordini', config);
                setOrdini(response.data);
            } catch (error) {
                console.error("Errore caricamento ordini:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (token) scaricaOrdini();
    }, [token]);

    const toggleDettagli = async (idOrdine: number) => {
        if (ordineEspanso === idOrdine) {
            setOrdineEspanso(null);
            return;
        }

        setOrdineEspanso(idOrdine);
        setIsLoadingDettagli(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = `http://localhost:8084/api/user/ordine/${idOrdine}/dettagli`;
            const response = await axios.get(url, config);
            setDettagliOrdine(response.data);
        } catch (error) {
            window.alert("Impossibile caricare i dettagli dell'ordine.");
            setOrdineEspanso(null);
        } finally {
            setIsLoadingDettagli(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toUpperCase();
        if (s === 'COMPLETATO') return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3 py-1 rounded-lg">Completato</Badge>;
        if (s === 'IN_ATTESA' || s === 'ELABORAZIONE') return <Badge className="bg-amber-500 text-white border-none px-3 py-1 rounded-lg">In Attesa</Badge>;
        if (s === 'SPEDITO') return <Badge className="bg-blue-500 text-white border-none px-3 py-1 rounded-lg">Spedito</Badge>;
        return <Badge variant="secondary" className="px-3 py-1 rounded-lg">{status}</Badge>;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
            <Navbar token={token} setToken={setToken} />

            <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 hover:bg-white rounded-xl">
                    <ChevronLeft className="mr-2 w-4 h-4" /> Torna allo Shop
                </Button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                        <History className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">I miei Ordini</h1>
                        <p className="text-slate-500 font-medium">Gestisci e traccia i tuoi acquisti recenti</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : ordini.length > 0 ? (
                    <div className="space-y-6">
                        {ordini.map((ord) => (
                            <Card key={ord.id} className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                                <CardContent className="p-0">
                                    {/* Header dell'ordine */}
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                                    <Package className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Codice Ordine</p>
                                                    <p className="text-xl font-bold text-slate-900 tracking-tight">{ord.codiceOrdine}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-grow max-w-2xl">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Data</p>
                                                    <p className="font-bold text-slate-700">{new Date(ord.dataOrdine).toLocaleDateString()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Truck className="w-3 h-3" /> Status</p>
                                                    {getStatusBadge(ord.statoOrdine)}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase">Totale</p>
                                                    <p className="text-xl font-black text-slate-900">€{ord.totalePrezzo.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => toggleDettagli(ord.id)}
                                                variant={ordineEspanso === ord.id ? "default" : "outline"}
                                                className={`rounded-xl h-12 px-6 font-bold transition-all ${ordineEspanso === ord.id ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                Dettagli <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-300 ${ordineEspanso === ord.id ? 'rotate-180' : ''}`} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Sezione Espandibile */}
                                    <AnimatePresence>
                                        {ordineEspanso === ord.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="bg-slate-50/80 border-t border-slate-100 p-8">
                                                    {isLoadingDettagli ? (
                                                        <div className="flex justify-center py-8">
                                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                            {/* Lista Prodotti */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                                                    <BoxIcon className="w-4 h-4" /> Articoli inclusi
                                                                </h4>
                                                                {dettagliOrdine.map((d, i) => (
                                                                    <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                                                                                {d.quantita}x
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-800">Box Pasto #{d.boxid}</p>
                                                                                <p className="text-xs font-medium text-slate-400">Prezzo unitario: €{d.prezzounitario.toFixed(2)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <p className="font-black text-slate-900">€{(d.prezzounitario * d.quantita).toFixed(2)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Spedizione & Pagamento */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                                        <MapPin className="w-4 h-4" /> Spedizione
                                                                    </h4>
                                                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                                                                        <p className="font-black text-slate-900 text-sm mb-2 uppercase text-indigo-600">{dettagliOrdine[0]?.corriere}</p>
                                                                        <p className="text-sm font-bold text-slate-700">{dettagliOrdine[0]?.indirizzoresponsedto.via}, {dettagliOrdine[0]?.indirizzoresponsedto.civico}</p>
                                                                        <p className="text-xs font-medium text-slate-500">{dettagliOrdine[0]?.indirizzoresponsedto.cap} {dettagliOrdine[0]?.indirizzoresponsedto.citta} ({dettagliOrdine[0]?.indirizzoresponsedto.provincia})</p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                                        <CreditCard className="w-4 h-4" /> Pagamento
                                                                    </h4>
                                                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                                                        <p className="font-black text-slate-900 text-sm mb-1">{dettagliOrdine[0]?.metodopagamento.replace(/_/g, ' ')}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Eseguito il {new Date(dettagliOrdine[0]?.datapagamento).toLocaleDateString()}</p>
                                                                        <Separator className="mb-4" />
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs font-bold text-slate-400">Importo</span>
                                                                            <span className="text-lg font-black text-slate-900">€{dettagliOrdine[0]?.importo.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-transparent shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                                <Package className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 mb-2">Ancora nessun ordine</h3>
                            <p className="text-slate-400 mb-8 max-w-xs">Sembra che tu non abbia ancora gustato le nostre box!</p>
                            <Button onClick={() => navigate('/')} size="lg" className="rounded-2xl font-bold h-14 px-8 shadow-lg shadow-primary/20">
                                Inizia ora
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default Ordini;