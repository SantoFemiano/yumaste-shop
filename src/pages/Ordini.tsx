import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Ordine {
    id: number;
    codiceOrdine: string;
    dataOrdine: string;
    totalePrezzo: number;
    statoOrdine: string;
    statoSpedizione: string;
}

const Ordini: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [ordini, setOrdini] = useState<Ordine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const scaricaOrdini = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // URL basato sul tuo Swagger precedente
                //manca la get degli ordini dell utente in spring
                const url = 'http://localhost:8084/api/user/ordini';
                const response = await axios.get(url, config);
                setOrdini(response.data);
            } catch (error) {
                console.error("Errore caricamento ordini:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (token) scaricaOrdini();
    }, [token]);

    // Funzione per colorare lo stato dell'ordine
    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETATO': return 'bg-green-100 text-green-800';
            case 'IN_ATTESA': return 'bg-yellow-100 text-yellow-800';
            case 'SPEDITO': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar token={token} setToken={setToken} />
            <div className="p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">I miei Ordini</h1>
                    <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">
                        Torna indietro
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-xl animate-pulse shadow-sm"></div>
                        ))}
                    </div>
                ) : ordini.length > 0 ? (
                    <div className="space-y-6">
                        {ordini.map((ord) => (
                            <div key={ord.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Codice Ordine</p>
                                            <p className="text-lg font-mono font-bold text-indigo-600">{ord.codiceOrdine}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ord.statoOrdine)}`}>
                                                {ord.statoOrdine}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-xs text-gray-400">Data</p>
                                            <p className="font-medium">{new Date(ord.dataOrdine).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Spedizione</p>
                                            <p className="font-medium text-sm">{ord.statoSpedizione}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Totale</p>
                                            <p className="font-bold text-lg">€ {ord.totalePrezzo.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <button className="text-sm font-semibold text-indigo-600 border border-indigo-600 px-4 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                                                Dettagli
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-inner border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-xl mb-4">Non hai ancora effettuato ordini.</p>
                        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold">
                            Vai allo shop
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ordini;