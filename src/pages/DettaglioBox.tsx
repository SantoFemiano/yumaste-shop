import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

// --- INTERFACCE BASATE SUL TUO JSON ---
interface Ingrediente {
    nomeIngrediente: string;
    quantitaNellaBox: number;
    unitaMisura: string;
    chilocalorie: number;
    proteine: number;
    carboidrati: number;
    zuccheri: number;
    fibre: number;
    grassi: number;
    sale: number;
}

interface DettaglioBoxData {
    id: number;
    nome: string;
    categoria: string;
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
    const { id } = useParams<{ id: string }>(); // Prende l'ID dall'URL
    const navigate = useNavigate();

    const [box, setBox] = useState<DettaglioBoxData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);

    useEffect(() => {
        const scaricaDettaglio = async () => {
            try {
                // Endpoint pubblico: non serve il token per leggere i dettagli
                const url = `http://localhost:8084/api/public/box/detail/${id}`;
                const response = await axios.get(url);
                setBox(response.data);
            } catch (error) {
                console.error("Errore nel caricamento dei dettagli:", error);
                setErrore("Impossibile caricare i dettagli di questa box.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) scaricaDettaglio();
    }, [id]);

    const aggiungiAlCarrello = async () => {
        if (!token) {
            alert("Devi effettuare l'accesso per aggiungere prodotti al carrello! 🔒");
            navigate('/login');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { boxId: Number(id), quantita: 1 };
            await axios.post('http://localhost:8084/api/user/cart/add', payload, config);
            alert(`Hai aggiunto "${box?.nome}" al tuo carrello! 🛒`);
        } catch (error) {
            console.error("Errore carrello:", error);
            alert("Errore durante l'aggiunta al carrello.");
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-pulse text-xl text-slate-500 font-semibold">Caricamento ricetta...</div></div>;
    if (errore || !box) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-red-500 text-xl">{errore || "Box non trovata"}</div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <Navbar token={token} setToken={setToken} />

            <main className="max-w-6xl mx-auto p-6 lg:p-8 mt-6">
                <button onClick={() => navigate(-1)} className="text-indigo-600 font-semibold hover:underline mb-6 flex items-center gap-2">
                    &larr; Torna al catalogo
                </button>

                {/* SEZIONE SUPERIORE: Immagine e Info Base */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row mb-8">
                    {/* Immagine */}
                    <div className="md:w-1/2 h-80 md:h-auto bg-slate-200 relative flex items-center justify-center">
                        {box.immagineUrl ? (
                            <img src={box.immagineUrl} alt={box.nome} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-8xl">🍲</span>
                        )}
                        {box.prezzoScontato && box.prezzoScontato < box.prezzoOriginale && (
                            <div className="absolute top-6 left-6 bg-rose-500 text-white font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-wide">
                                -{box.percentualeSconto}% OFF
                            </div>
                        )}
                    </div>

                    {/* Dettagli acquisto */}
                    <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                        <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">{box.categoria}</span>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">{box.nome}</h1>

                        <div className="flex items-end gap-4 mb-8">
                            {box.prezzoScontato && box.prezzoScontato < box.prezzoOriginale ? (
                                <>
                                    <span className="text-xl text-slate-400 line-through font-medium">€{box.prezzoOriginale.toFixed(2)}</span>
                                    <span className="text-5xl font-black text-rose-600">€{box.prezzoScontato.toFixed(2)}</span>
                                </>
                            ) : (
                                <span className="text-5xl font-black text-slate-900">€{box.prezzoOriginale.toFixed(2)}</span>
                            )}
                        </div>

                        <button
                            onClick={aggiungiAlCarrello}
                            className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white text-lg font-bold py-4 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <span>Aggiungi al Carrello</span>
                            <span>🛒</span>
                        </button>
                    </div>
                </div>

                {/* SEZIONE INFERIORE: Dettagli Tecnici in Griglia */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Colonna Sinistra: Valori Nutrizionali & Allergeni */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Macro */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">📊 Valori Nutrizionali <span className="text-sm font-normal text-slate-400">(Totali)</span></h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 p-4 rounded-2xl text-center">
                                    <div className="text-2xl font-black text-orange-600">{box.macroTotali.chilocalorie}</div>
                                    <div className="text-xs font-bold text-orange-800 uppercase tracking-wide mt-1">Kcal</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                                    <div className="text-2xl font-black text-blue-600">{box.macroTotali.proteine.toFixed(1)}g</div>
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mt-1">Proteine</div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-2xl text-center">
                                    <div className="text-2xl font-black text-yellow-600">{box.macroTotali.carboidrati.toFixed(1)}g</div>
                                    <div className="text-xs font-bold text-yellow-800 uppercase tracking-wide mt-1">Carboidrati</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-2xl text-center">
                                    <div className="text-2xl font-black text-red-600">{box.macroTotali.grassi.toFixed(1)}g</div>
                                    <div className="text-xs font-bold text-red-800 uppercase tracking-wide mt-1">Grassi</div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-slate-500 grid grid-cols-2 gap-2 px-2">
                                <div>Zuccheri: <span className="font-semibold text-slate-700">{box.macroTotali.zuccheri.toFixed(1)}g</span></div>
                                <div>Fibre: <span className="font-semibold text-slate-700">{box.macroTotali.fibre.toFixed(1)}g</span></div>
                                <div>Sale: <span className="font-semibold text-slate-700">{box.macroTotali.sale.toFixed(2)}g</span></div>
                            </div>
                        </div>

                        {/* Allergeni */}
                        {box.allergeni && box.allergeni.length > 0 && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">⚠️ Allergeni</h3>
                                <div className="flex flex-wrap gap-2">
                                    {box.allergeni.map((allergene, index) => (
                                        <span key={index} className="bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-sm">
                                            {allergene}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Colonna Destra: Ingredienti */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                            <h3 className="text-2xl font-bold mb-6">Cosa troverai nella box</h3>

                            <div className="divide-y divide-slate-100">
                                {box.ingredienti.map((ing, idx) => (
                                    <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="font-bold text-lg text-slate-900">{ing.nomeIngrediente}</div>
                                            <div className="text-sm text-slate-500 mt-1">
                                                {ing.chilocalorie} kcal • {ing.proteine}g pro • {ing.carboidrati}g carbo • {ing.grassi}g grassi
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl">
                                                {ing.quantitaNellaBox} {ing.unitaMisura}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {box.ingredienti.length === 0 && (
                                    <div className="text-slate-500 italic py-4">Nessun ingrediente specificato.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DettaglioBox;