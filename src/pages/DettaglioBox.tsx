import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ShoppingCart,
    Zap,
    Beef,
    Wheat,
    Droplets,
    AlertTriangle,
    ListChecks,
    Loader2
} from 'lucide-react';

import Navbar from '../components/Navbar';

// --- INTERFACCE ---
interface Ingrediente {
    nomeIngrediente: string;
    quantitaNellaBox: number;
    unitaMisura: string;
    chilocalorie: number;
    proteine: number;
    carboidrati: number;
    grassi: number;
}

interface DettaglioBoxData {
    id: number;
    nome: string;
    categoria: string;
    porzioni: number; // Aggiunto per gestire le porzioni
    prezzoOriginale: number;
    prezzoScontato: number | null;
    percentualeSconto: number;
    immagineUrl: string;
    macroTotali: {
        proteine: number;
        carboidrati: number;
        grassi: number;
        zuccheri: number;
        fibre: number;
        sale: number;
        chilocalorie: number;
    };
    allergeni: string[];
    ingredienti: Ingrediente[];
}

const DettaglioBox: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [box, setBox] = useState<DettaglioBoxData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const [isPerPortion, setIsPerPortion] = useState(false); // Stato per il toggle "Per Porzione"

    useEffect(() => {
        const scaricaDettaglio = async () => {
            try {
                const url = `${BASE_URL}/api/public/box/detail/${id}`;
                const response = await axios.get(url);
                setBox(response.data);
            } catch {
                setErrore("Impossibile caricare i dettagli della box.");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) void scaricaDettaglio();
    }, [id]);

    const aggiungiAlCarrello = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${BASE_URL}/api/user/cart/add`, { boxId: Number(id), quantita: 1 }, config);
            window.alert("Aggiunto al carrello! 🛒");
        } catch {
            window.alert("Errore nell'aggiunta al carrello.");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
    );

    if (errore || !box) return <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">{errore || "Box non trovata"}</div>;

    // Calcolo del divisore basato sullo stato del toggle e sulle porzioni effettive
    const divisore = (isPerPortion && box.porzioni && box.porzioni > 0) ? box.porzioni : 1;

    // Valori Nutrizionali calcolati dinamicamente
    const kcal = (box.macroTotali?.chilocalorie || 0) / divisore;
    const proteine = (box.macroTotali?.proteine || 0) / divisore;
    const carboidrati = (box.macroTotali?.carboidrati || 0) / divisore;
    const grassi = (box.macroTotali?.grassi || 0) / divisore;
    const zuccheri = (box.macroTotali?.zuccheri || 0) / divisore;
    const fibre = (box.macroTotali?.fibre || 0) / divisore;
    const sale = (box.macroTotali?.sale || 0) / divisore;

    const totaleGrammiMacro = (proteine + carboidrati + grassi) || 1;

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
            <Navbar token={token} setToken={setToken} />

            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
                >
                    <ChevronLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Torna al catalogo
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* COLONNA SINISTRA: MEDIA & INFO ACQUISTO */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-video rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-white"
                        >
                            {box.immagineUrl ? (
                                <img src={box.immagineUrl} alt={box.nome} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-8xl">🍲</div>
                            )}
                            {box.prezzoScontato && box.prezzoOriginale && box.prezzoScontato < box.prezzoOriginale &&  (
                                <div className="absolute top-8 left-8 bg-rose-500 text-white px-6 py-2 text-lg font-black rounded-2xl shadow-xl">
                                    -{box.percentualeSconto}%
                                </div>
                            )}
                        </motion.div>

                        <div className="mt-10 space-y-6">
                            <span className="inline-block border border-indigo-200 text-indigo-600 bg-indigo-50/50 uppercase font-bold tracking-widest px-4 py-1 rounded-full text-xs">
                                {box.categoria}
                            </span>
                            <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">{box.nome}</h1>

                            <div className="flex flex-wrap items-center gap-8 py-4">
                                {/* Blocco Prezzi */}
                                {(box?.prezzoScontato ?? 0) < (box?.prezzoOriginale ?? 0) ? (
                                    <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black text-rose-600">
                                 €{Number(box?.prezzoScontato ?? 0).toFixed(2)}
                                      </span>
                                           <span className="text-xl text-slate-400 line-through">
                                            €{Number(box?.prezzoOriginale ?? 0).toFixed(2)}
                                             </span>
                                    </div>
                                ) : (
                                    <span className="text-5xl font-black text-slate-900">
                                 €{Number(box?.prezzoOriginale ?? 0).toFixed(2)}
                                  </span>
                                )}

                                {/* BOTTONE aggiungi al carrello */}
                                <button
                                    onClick={aggiungiAlCarrello}
                                    className="ml-auto h-16 px-10 rounded-2xl bg-slate-900 text-white text-lg font-bold shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all flex items-center"
                                >
                                    <ShoppingCart className="mr-3 w-6 h-6" />
                                    Aggiungi al carrello
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COLONNA DESTRA: NUTRITION HUB AGGIORNATO */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-4xl shadow-xl shadow-slate-200/50 overflow-hidden border border-white"
                        >
                            <div className="bg-slate-900 p-8 text-white">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        Nutrition Hub
                                    </h3>

                                    {/* Toggle Porzioni/Totale */}
                                    {box.porzioni && box.porzioni > 1 && (
                                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                            <button
                                                onClick={() => setIsPerPortion(false)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isPerPortion ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                Totale
                                            </button>
                                            <button
                                                onClick={() => setIsPerPortion(true)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${isPerPortion ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                Per Porzione <span className="opacity-75">({box.porzioni})</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right mb-6">
                                    <div className="text-4xl font-black">{Math.round(kcal)}</div>
                                    <div className="text-xs uppercase font-bold text-slate-400">
                                        Kcal {isPerPortion ? 'Per Porzione' : 'Totali'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                        <Beef className="w-4 h-4 text-blue-400 mb-2" />
                                        <div className="text-xl font-bold">{proteine.toFixed(1)}g</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Proteine</div>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                        <Wheat className="w-4 h-4 text-orange-400 mb-2" />
                                        <div className="text-xl font-bold">{carboidrati.toFixed(1)}g</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Carbo</div>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                        <Droplets className="w-4 h-4 text-yellow-400 mb-2" />
                                        <div className="text-xl font-bold">{grassi.toFixed(1)}g</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Grassi</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold text-slate-700">
                                        <span>Ripartizione Energetica</span>
                                        <span className="text-indigo-600">Bilanciamento Macro</span>
                                    </div>
                                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
                                        <div style={{ width: `${(proteine / totaleGrammiMacro) * 100}%` }} className="bg-blue-500" />
                                        <div style={{ width: `${(carboidrati / totaleGrammiMacro) * 100}%` }} className="bg-orange-500" />
                                        <div style={{ width: `${(grassi / totaleGrammiMacro) * 100}%` }} className="bg-yellow-400" />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 px-1">
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> PRO</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> CARBO</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> GRASSI</span>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 w-full" />

                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Zuccheri</span>
                                        <span className="font-bold text-slate-800">{zuccheri.toFixed(1)}g</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Fibre</span>
                                        <span className="font-bold text-slate-800">{fibre.toFixed(1)}g</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Sale</span>
                                        <span className="font-bold text-rose-500">{sale.toFixed(2)}g</span>
                                    </div>
                                </div>

                                {box.allergeni && box.allergeni.length > 0 && (
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase mb-3">
                                            <AlertTriangle className="w-4 h-4" /> Attenzione Allergeni
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {box.allergeni.map((allergene) => (
                                                <span key={allergene} className="px-3 py-1 rounded-lg border border-rose-100 bg-rose-50 text-rose-700 font-bold text-xs">
                                                    {allergene}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* SEZIONE INGREDIENTI */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-white rounded-4xl shadow-lg p-8 md:p-12 border border-slate-50"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                            <ListChecks className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-slate-900">Cosa troverai dentro</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {box.ingredienti?.map((ing, idx) => (
                            <div key={ing.nomeIngrediente || idx} className="group relative flex items-start gap-5 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors font-black">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-slate-900 leading-tight">{ing.nomeIngrediente}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-2 font-bold">
                                        <span className="text-indigo-600">{ing.quantitaNellaBox}{ing.unitaMisura}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{ing.proteine}g Proteine</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{ing.carboidrati}g Carboidrati</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{ing.grassi}g Grassi</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase mb-3">{ing.chilocalorie}Kcal</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default DettaglioBox;