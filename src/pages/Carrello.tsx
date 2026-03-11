import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Carrello as CarrelloItem } from '../types/Carrello';
import Navbar from '../components/Navbar';

const Carrello: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();

    // --- STATI CARRELLO ---
    const [elementiCarrello, setElementiCarrello] = useState<CarrelloItem[]>([]);
    const [totaleBackend, setTotaleBackend] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);

    // --- STATI CHECKOUT ---
    const [indirizzi, setIndirizzi] = useState<any[]>([]);
    const [indirizzoSelezionato, setIndirizzoSelezionato] = useState<number | null>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    // --- FUNZIONE PER SCARICARE I DATI (resa useCallback per poterla riutilizzare) ---
    const scaricaDati = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setIsLoading(true);
        setErrore(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Scarichiamo il Carrello
            const resCart = await axios.get('http://localhost:8084/api/user/cart', config);
            const dati = resCart.data;

            if (dati && Array.isArray(dati.items)) {
                setElementiCarrello(dati.items);
                setTotaleBackend(dati.totalPrice || 0);
            } else {
                setElementiCarrello([]);
                setTotaleBackend(0);
            }

            // 2. Scarichiamo gli Indirizzi (solo al caricamento iniziale per ottimizzare)
            if (isInitialLoad) {
                const resInd = await axios.get('http://localhost:8084/api/user/indirizzi', config);
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

    // Chiamata iniziale
    useEffect(() => {
        if (token) scaricaDati(true);
    }, [token, scaricaDati]);

    // --- NUOVE FUNZIONI GESTIONE CARRELLO ---

    const aggiornaQuantita = async (boxId: number, nuovaQuantita: number) => {
        if (nuovaQuantita < 1) return; // Impedisce valori minori di 1

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { boxId: boxId, quantita: nuovaQuantita };

            // Assicurati che l'URL coincida con il tuo Controller Spring Boot
            await axios.put('http://localhost:8084/api/user/cart/update', payload, config);

            // Ricarica solo il carrello in background
            scaricaDati(false);
        } catch (error) {
            console.error("Errore aggiornamento quantità:", error);
            alert("Impossibile aggiornare la quantità.");
        }
    };

    const rimuoviDalCarrello = async (boxId: number) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Assicurati che l'URL coincida con il tuo Controller Spring Boot
            await axios.delete(`http://localhost:8084/api/user/cart/remove/${boxId}`, config);

            // Ricarica solo il carrello in background
            scaricaDati(false);
        } catch (error) {
            console.error("Errore rimozione prodotto:", error);
            alert("Impossibile rimuovere il prodotto dal carrello.");
        }
    };


    // --- FUNZIONE CHECKOUT ---
    const gestisciCheckout = async () => {
        if (!indirizzoSelezionato) {
            alert("Per favore, seleziona un indirizzo per la consegna.");
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                indirizzoId: indirizzoSelezionato,
                metodoPagamento: "CARTA_DI_CREDITO"
            };

            const url = 'http://localhost:8084/api/user/checkout';
            const response = await axios.post(url, payload, config);

            alert(`Ordine confermato! Codice: ${response.data.codiceOrdine} 🎉`);
            navigate('/');
        } catch (error) {
            console.error("Errore durante il checkout:", error);
            alert("Errore nel processare l'ordine.");
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const listaSicura = Array.isArray(elementiCarrello) ? elementiCarrello : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar token={token} setToken={setToken} />

            <div className="p-4 md:p-8 mt-4">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Il tuo Carrello</h2>
                        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            &larr; Continua gli acquisti
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : errore ? (
                        <div className="text-center py-12 bg-red-50 rounded-xl">
                            <span className="text-3xl mb-3 block">⚠️</span>
                            <p className="font-semibold text-red-600">{errore}</p>
                        </div>
                    ) : listaSicura.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <span className="text-6xl block mb-4">🛒</span>
                            <p className="text-xl font-bold text-gray-400 mb-6">Il tuo carrello è tristemente vuoto.</p>
                            <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                Vai al Catalogo
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* LISTA PRODOTTI AGGIORNATA */}
                            <div className="divide-y divide-gray-100 mb-10">
                                {listaSicura.map((item) => (
                                    <div key={item.boxId} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center py-6">

                                        {/* Immagine */}
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {item.immagineUrl ? (
                                                <img src={item.immagineUrl} alt={item.nomeBox} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl">🍲</span>
                                            )}
                                        </div>

                                        {/* Dettagli e Controlli */}
                                        <div className="flex-grow w-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight pr-4">{item.nomeBox}</h3>
                                                <p className="text-lg font-black text-gray-900 whitespace-nowrap">
                                                    € {item.prezzoScontato ? (item.prezzoScontato * item.quantita).toFixed(2) : "0.00"}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                                {/* Selettore Quantità */}
                                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 shadow-sm h-10">
                                                    <button
                                                        onClick={() => aggiornaQuantita(item.boxId, item.quantita - 1)}
                                                        disabled={item.quantita <= 1}
                                                        className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors rounded-l-lg font-bold text-xl"
                                                        title="Riduci quantità"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-12 h-full flex items-center justify-center font-bold text-sm bg-white border-x border-gray-200">
                                                        {item.quantita}
                                                    </span>
                                                    <button
                                                        onClick={() => aggiornaQuantita(item.boxId, item.quantita + 1)}
                                                        className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors rounded-r-lg font-bold text-xl"
                                                        title="Aumenta quantità"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Prezzo unitario (opzionale, per chiarezza) */}
                                                <span className="text-xs font-semibold text-gray-400">
                                                    (€ {item.prezzoScontato?.toFixed(2)} / pz)
                                                </span>

                                                {/* Tasto Rimuovi */}
                                                <button
                                                    onClick={() => rimuoviDalCarrello(item.boxId)}
                                                    className="ml-auto text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <span>🗑️</span> Rimuovi
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SELEZIONE INDIRIZZO */}
                            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📍</span> Seleziona indirizzo di consegna
                                </h3>
                                {indirizzi.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {indirizzi.map((ind) => (
                                            <div
                                                key={ind.id}
                                                onClick={() => setIndirizzoSelezionato(ind.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    indirizzoSelezionato === ind.id
                                                        ? "border-indigo-600 bg-white shadow-md"
                                                        : "border-gray-200 bg-white hover:border-indigo-300"
                                                }`}
                                            >
                                                <p className="text-sm font-bold text-gray-800">{ind.via}, {ind.civico}</p>
                                                <p className="text-sm text-gray-500">{ind.cap} {ind.citta} ({ind.provincia})</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 text-orange-800 p-4 rounded-lg text-sm font-semibold border border-orange-200">
                                        Nessun indirizzo trovato. Aggiungine uno dal tuo Profilo prima di procedere.
                                    </div>
                                )}
                            </div>

                            {/* TOTALE E TASTO PAGAMENTO */}
                            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-end">
                                <div className="text-right w-full md:w-auto">
                                    <div className="flex justify-between md:justify-end items-end gap-8 mb-6">
                                        <span className="text-lg font-semibold text-gray-500">Totale Ordine</span>
                                        <span className="font-black text-gray-900 text-4xl tracking-tight">
                                            € {totaleBackend.toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={gestisciCheckout}
                                        disabled={isCheckoutLoading || !indirizzoSelezionato}
                                        className={`w-full md:w-auto px-10 py-4 text-white font-black text-lg rounded-xl transition-all flex justify-center items-center gap-2 ${
                                            isCheckoutLoading || !indirizzoSelezionato
                                                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                                : "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-200 active:scale-95"
                                        }`}
                                    >
                                        {isCheckoutLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Elaborazione...
                                            </>
                                        ) : (
                                            "Conferma e Paga 💳"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Carrello;