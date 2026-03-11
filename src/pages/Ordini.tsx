import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

    // Stati per la lista degli ordini principale
    const [ordini, setOrdini] = useState<Ordine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Stati per la gestione del singolo ordine espanso
    const [ordineEspanso, setOrdineEspanso] = useState<number | null>(null);
    const [dettagliOrdine, setDettagliOrdine] = useState<OrdiniDettagliDTO[]>([]);
    const [isLoadingDettagli, setIsLoadingDettagli] = useState(false);

    useEffect(() => {
        const scaricaOrdini = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // URL per prendere tutti gli ordini dell'utente
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

    // Funzione per scaricare i dettagli e aprire/chiudere la tendina
    const toggleDettagli = async (idOrdine: number) => {
        // Se clicco su un ordine già aperto, lo chiudo
        if (ordineEspanso === idOrdine) {
            setOrdineEspanso(null);
            setDettagliOrdine([]);
            return;
        }

        // Altrimenti lo apro e carico i dati
        setOrdineEspanso(idOrdine);
        setIsLoadingDettagli(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // L'URL esatto che abbiamo creato nel Controller Spring Boot
            const url = `http://localhost:8084/api/user/ordine/${idOrdine}/dettagli`;
            const response = await axios.get(url, config);

            setDettagliOrdine(response.data); // È una List<OrdiniDettagliDTO>
        } catch (error) {
            console.error("Errore caricamento dettagli ordine:", error);
            alert("Impossibile caricare i dettagli dell'ordine.");
            setOrdineEspanso(null);
        } finally {
            setIsLoadingDettagli(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
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

                                {/* HEADER DELL'ORDINE (Sempre visibile) */}
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
                                            <button
                                                onClick={() => toggleDettagli(ord.id)}
                                                className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${ordineEspanso === ord.id ? 'bg-indigo-600 text-white' : 'text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
                                            >
                                                {ordineEspanso === ord.id ? 'Chiudi' : 'Dettagli'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* SEZIONE ESPANSA (Dettagli scaricati dall'API) */}
                                {ordineEspanso === ord.id && (
                                    <div className="bg-slate-50 border-t border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {isLoadingDettagli ? (
                                            <div className="flex justify-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            </div>
                                        ) : dettagliOrdine.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                                {/* Colonna 1: Prodotti Acquistati */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Box nell'Ordine:</h3>
                                                    <div className="space-y-3">
                                                        {dettagliOrdine.map((dettaglio, index) => (
                                                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center font-bold">
                                                                        {dettaglio.quantita}x
                                                                    </div>
                                                                    <div>
                                                                        {/* NOTA: Il tuo DTO manda solo il boxid, se in futuro aggiungi il nome della box nel backend, cambialo qui! */}
                                                                        <p className="font-semibold text-gray-800">Box #{dettaglio.boxid}</p>
                                                                        <p className="text-xs text-gray-500">€{dettaglio.prezzounitario.toFixed(2)} cad.</p>
                                                                    </div>
                                                                </div>
                                                                <div className="font-bold text-gray-900">
                                                                    €{(dettaglio.prezzounitario * dettaglio.quantita).toFixed(2)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Colonna 2: Info Spedizione e Pagamento */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Indirizzo di Spedizione</h3>
                                                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm text-gray-600">
                                                            <p className="font-semibold text-gray-800">{dettagliOrdine[0].corriere}</p>
                                                            <p>{dettagliOrdine[0].indirizzoresponsedto.via}, {dettagliOrdine[0].indirizzoresponsedto.civico}</p>
                                                            <p>{dettagliOrdine[0].indirizzoresponsedto.cap} {dettagliOrdine[0].indirizzoresponsedto.citta} ({dettagliOrdine[0].indirizzoresponsedto.provincia})</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Dettagli Pagamento</h3>
                                                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm text-gray-600 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{dettagliOrdine[0].metodopagamento}</p>
                                                                <p className="text-xs text-gray-400">Eseguito il {new Date(dettagliOrdine[0].datapagamento).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="font-black text-lg text-gray-900">
                                                                €{dettagliOrdine[0].importo.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">Nessun dettaglio disponibile.</p>
                                        )}
                                    </div>
                                )}
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