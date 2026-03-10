import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import type { BoxCatalogo } from '../types/BoxCatalogo';
import { useNavigate } from 'react-router-dom';

const Catalogo: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();

    const [boxes, setBoxes] = useState<BoxCatalogo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);

    const [paginaAttuale, setPaginaAttuale] = useState(0);
    const [totalePagine, setTotalePagine] = useState(0);

    useEffect(() => {
        scaricaCatalogo(paginaAttuale);
    }, [paginaAttuale]);

    const scaricaCatalogo = async (numeroPagina: number) => {
        setIsLoading(true);
        setErrore(null);

        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const url = `http://localhost:8084/api/public/boxes?page=${numeroPagina}&size=8`;
            const response = await axios.get(url, config);

            const datiRicevuti = response.data;

            if (datiRicevuti && Array.isArray(datiRicevuti.content)) {
                setBoxes(datiRicevuti.content);
                setTotalePagine(datiRicevuti.totalPages);
            } else {
                setErrore("Formato dati non valido ricevuto dal server.");
                setBoxes([]);
            }
        } catch (error) {
            console.error("Errore durante il download del catalogo:", error);
            setErrore("Impossibile caricare il catalogo. Verifica la tua connessione o riprova più tardi.");
            setBoxes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const aggiungiAlCarrello = async (id: number, nomeBox: string) => {
        if (!token) {
            alert("Devi effettuare l'accesso per aggiungere prodotti al carrello! 🔒");
            navigate('/login');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { boxId: id, quantita: 1 };
            const url = 'http://localhost:8084/api/user/cart/add';

            await axios.post(url, payload, config);
            alert(`Hai aggiunto "${nomeBox}" al tuo carrello! 🛒`);
        } catch (error) {
            console.error("Errore durante l'aggiunta al carrello:", error);
            alert("Ops! Non è stato possibile aggiungere la box al carrello. Riprova.");
        }
    };

    const vaiAllaPaginaPrecedente = () => {
        if (paginaAttuale > 0) setPaginaAttuale(paginaAttuale - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const vaiAllaPaginaSuccessiva = () => {
        if (paginaAttuale < totalePagine - 1) setPaginaAttuale(paginaAttuale + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-0 h-[420px] animate-pulse border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="h-48 bg-slate-200"></div>
                    <div className="p-6 flex flex-col flex-grow gap-4">
                        <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
                        <div className="h-7 bg-slate-200 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded-full w-full mt-2"></div>
                        <div className="h-4 bg-slate-200 rounded-full w-5/6"></div>
                        <div className="mt-auto flex justify-between items-end">
                            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
                            <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar token={token} setToken={setToken} />
            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Esplora le nostre Box</h2>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Ingredienti freschi, ricette deliziose e porzioni perfette. Scegli la tua box e inizia a cucinare come uno chef.
                    </p>
                </div>

                {errore ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm flex items-start gap-4">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="text-red-800 font-bold text-lg mb-1">Qualcosa è andato storto</h3>
                            <p className="text-red-700">{errore}</p>
                            <button
                                onClick={() => scaricaCatalogo(paginaAttuale)}
                                className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md font-semibold hover:bg-red-200 transition-colors"
                            >
                                Riprova
                            </button>
                        </div>
                    </div>
                ) : isLoading ? (
                    <SkeletonLoader />
                ) : boxes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                        <span className="text-6xl mb-4">🍽️</span>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Il menù è vuoto</h3>
                        <p className="text-slate-500">Non ci sono box disponibili in questa pagina al momento.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {boxes.map((box) => (
                                <div
                                    key={box.id}
                                    onClick={() => navigate(`/box/${box.id}`)}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                                >
                                    <div className="relative h-48 bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🍲</span>
                                        {(box.prezzoScontato && box.prezzoScontato < (box.prezzo || 0)) ? (
                                            <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                                                {box.scontoApplicato} OFF
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {(box.categorie || []).map(cat => (
                                                <span key={cat} className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {box.nome}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
                                            {box.descrizione}
                                        </p>

                                        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-4">
                                            <div className="flex flex-col">
                                                {(box.prezzoScontato && box.prezzoScontato < (box.prezzo || 0)) ? (
                                                    <>
                                                        <span className="text-xs text-slate-400 line-through font-medium">
                                                            €{(box.prezzo || 0).toFixed(2)}
                                                        </span>
                                                        <span className="text-2xl font-black text-rose-600">
                                                            €{box.prezzoScontato.toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-black text-slate-900">
                                                        €{(box.prezzo || 0).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    aggiungiAlCarrello(box.id, box.nome);
                                                }}
                                                className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-200 active:scale-95 flex items-center justify-center"
                                                title="Aggiungi al carrello"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalePagine > 1 && (
                            <div className="flex items-center justify-center gap-6 mt-16 mb-8">
                                <button
                                    onClick={vaiAllaPaginaPrecedente}
                                    disabled={paginaAttuale === 0}
                                    className="px-5 py-2.5 rounded-xl font-semibold transition-all bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow disabled:opacity-40 disabled:hover:shadow-sm disabled:cursor-not-allowed"
                                >
                                    &larr; Precedente
                                </button>
                                <div className="text-slate-500 font-medium">
                                    Pagina <span className="text-slate-900 font-bold">{paginaAttuale + 1}</span> di <span className="text-slate-900 font-bold">{totalePagine}</span>
                                </div>
                                <button
                                    onClick={vaiAllaPaginaSuccessiva}
                                    disabled={paginaAttuale >= totalePagine - 1}
                                    className="px-5 py-2.5 rounded-xl font-semibold transition-all bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow disabled:opacity-40 disabled:hover:shadow-sm disabled:cursor-not-allowed"
                                >
                                    Successiva &rarr;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Catalogo;