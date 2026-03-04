import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import type { BoxCatalogo } from '../types/BoxCatalogo';

const Catalogo: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const [boxes, setBoxes] = useState<BoxCatalogo[]>([]);
    const [caricamentoCatalogo, setCaricamentoCatalogo] = useState(true);

    // --- STATO PER LA PAGINAZIONE ---
    const [paginaAttuale, setPaginaAttuale] = useState(0);
    const [totalePagine, setTotalePagine] = useState(0);

    // Scarica i dati ogni volta che cambia la pagina attuale
    useEffect(() => {
        scaricaCatalogo(paginaAttuale);
    }, [paginaAttuale]);

    const scaricaCatalogo = async (numeroPagina: number) => {
        setCaricamentoCatalogo(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Aggiungiamo i parametri ?page=X all'URL per dire a Spring Boot quale pagina vogliamo
            const url = `http://localhost:8084/api/public/boxes?page=${numeroPagina}&size=8`;
            const response = await axios.get(url, config);

            const datiRicevuti = response.data;

            // Dato che Spring Boot restituisce un oggetto Page<BoxDTO>, i dati reali sono dentro ".content"
            if (datiRicevuti && Array.isArray(datiRicevuti.content)) {
                setBoxes(datiRicevuti.content);
                setTotalePagine(datiRicevuti.totalPages); // Salviamo il numero totale di pagine
            } else {
                console.error("Struttura Page non trovata nella risposta:", datiRicevuti);
                setBoxes([]);
            }

        } catch (error) {
            console.error("Errore durante il download del catalogo:", error);
            setBoxes([]);
        } finally {
            setCaricamentoCatalogo(false);
        }
    };

    const aggiungiAlCarrello = (boxId: number) => {
        alert(`Box ${boxId} aggiunta al carrello! (Simulazione)`);
    };

    // Funzioni per cambiare pagina
    const vaiAllaPaginaPrecedente = () => {
        if (paginaAttuale > 0) setPaginaAttuale(paginaAttuale - 1);
    };

    const vaiAllaPaginaSuccessiva = () => {
        if (paginaAttuale < totalePagine - 1) setPaginaAttuale(paginaAttuale + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar setToken={setToken} />

            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Esplora le nostre Box</h2>
                        <p className="text-slate-600">Ingredienti freschi e ricette deliziose, consegnati a casa tua.</p>
                    </div>
                </div>

                {caricamentoCatalogo ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {(boxes || []).map((box) => (
                                <div key={box.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">

                                    {box.prezzoScontato && (
                                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                                            {box.scontoApplicato}
                                        </div>
                                    )}

                                    <div className="h-48 bg-slate-200 flex items-center justify-center">
                                        <span className="text-5xl">🍲</span>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex gap-1 mb-2 flex-wrap">
                                            {(box.categorie || []).map(cat => (
                                                <span key={cat} className="bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-1 rounded-full">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-800 mb-1">{box.nome}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
                                            {box.descrizione}
                                        </p>

                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                {/* CORREZIONE: Aggiunto ( ... || 0) per prevenire il crash se le variabili sono undefined */}
                                                {box.prezzoScontato ? (
                                                    <>
                                                        <span className="text-xs text-slate-400 line-through block">€{(box.prezzo || 0).toFixed(2)}</span>
                                                        <span className="text-2xl font-black text-indigo-600">€{(box.prezzoScontato || 0).toFixed(2)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-black text-indigo-600">€{(box.prezzo || 0).toFixed(2)}</span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => aggiungiAlCarrello(box.id)}
                                                className="bg-slate-900 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg active:scale-95"
                                                title="Aggiungi al carrello"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- CONTROLLI DI PAGINAZIONE --- */}
                        {totalePagine > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                                <button
                                    onClick={vaiAllaPaginaPrecedente}
                                    disabled={paginaAttuale === 0}
                                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Precedente
                                </button>

                                <span className="text-slate-600 font-medium">
                                    Pagina {paginaAttuale + 1} di {totalePagine}
                                </span>

                                <button
                                    onClick={vaiAllaPaginaSuccessiva}
                                    disabled={paginaAttuale >= totalePagine - 1}
                                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Successiva
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!caricamentoCatalogo && boxes.length === 0 && (
                    <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        Nessuna Box disponibile al momento.
                    </div>
                )}
            </main>
        </div>
    );
};

export default Catalogo;