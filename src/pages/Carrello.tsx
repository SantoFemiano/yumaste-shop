import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const scaricaDati = async () => {
            setIsLoading(true);
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
                }

                // 2. Scarichiamo gli Indirizzi per la selezione
                const resInd = await axios.get('http://localhost:8084/api/user/indirizzi', config);
                setIndirizzi(resInd.data);

                // Se c'è almeno un indirizzo, selezioniamo il primo di default
                if (resInd.data.length > 0) {
                    setIndirizzoSelezionato(resInd.data[0].id);
                }

            } catch (error) {
                console.error("Errore API:", error);
                setErrore("Impossibile caricare i dati del carrello.");
            } finally {
                setIsLoading(false);
            }
        };

        if (token) scaricaDati();
    }, [token]);

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
            navigate('/profilo');
        } catch (error) {
            console.error("Errore durante il checkout:", error);
            alert("Errore nel processare l'ordine.");
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const listaSicura = Array.isArray(elementiCarrello) ? elementiCarrello : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar setToken={setToken} />

            <div className="p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Il tuo Carrello</h2>
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors">
                            Torna indietro
                        </button>
                    </div>

                    {isLoading ? (
                        <p className="text-center py-8 text-gray-500">Caricamento carrello in corso...</p>
                    ) : errore ? (
                        <p className="text-center py-8 text-red-500">{errore}</p>
                    ) : listaSicura.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">Il tuo carrello è vuoto.</p>
                    ) : (
                        <>
                            {/* LISTA PRODOTTI */}
                            <div className="space-y-4 mb-8">
                                {listaSicura.map((item) => (
                                    <div key={item.boxId} className="flex justify-between items-center py-4 border-b">
                                        <div className="flex gap-4 items-center">
                                            {item.immagineUrl && (
                                                <img src={item.immagineUrl} alt={item.nomeBox} className="w-16 h-16 rounded-md object-cover" />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold">{item.nomeBox}</h3>
                                                <p className="text-gray-500">Quantità: {item.quantita}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">€ {item.prezzoScontato ? item.prezzoScontato.toFixed(2) : "0.00"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SELEZIONE INDIRIZZO */}
                            <div className="bg-indigo-50 p-6 rounded-xl mb-8 border border-indigo-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">📍 Seleziona indirizzo di consegna</h3>
                                {indirizzi.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {indirizzi.map((ind) => (
                                            <div
                                                key={ind.id}
                                                onClick={() => setIndirizzoSelezionato(ind.id)}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    indirizzoSelezionato === ind.id
                                                        ? "border-indigo-600 bg-white"
                                                        : "border-transparent bg-white/50 hover:bg-white"
                                                }`}
                                            >
                                                <p className="text-sm font-medium">{ind.via}, {ind.civico} - {ind.citta}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-500">Nessun indirizzo trovato. Aggiungine uno nel profilo!</p>
                                )}
                            </div>

                            {/* TOTALE E TASTO PAGAMENTO */}
                            <div className="mt-8 flex justify-end">
                                <div className="text-right">
                                    <p className="text-xl text-gray-600 mb-4">
                                        Totale: <span className="font-bold text-gray-800 text-2xl">€ {totaleBackend.toFixed(2)}</span>
                                    </p>
                                    <button
                                        onClick={gestisciCheckout}
                                        disabled={isCheckoutLoading || !indirizzoSelezionato}
                                        className={`px-8 py-4 text-white font-bold rounded-xl shadow-lg transition-all ${
                                            isCheckoutLoading || !indirizzoSelezionato
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700 active:scale-95"
                                        }`}
                                    >
                                        {isCheckoutLoading ? "Elaborazione..." : "Conferma Ordine e Paga"}
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