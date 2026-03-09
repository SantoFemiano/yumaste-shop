import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface DatiUtente {
    nome: string;
    cognome: string;
    email: string;
    dataRegistrazione?: string;
}

interface Indirizzo {
    id: number;
    via: string;
    citta: string;
    cap: string;
    civico: string;
    provincia: string;
    note?: string;
}

const Profilo: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [utente, setUtente] = useState<DatiUtente | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const [indirizzi, setIndirizzi] = useState<Indirizzo[]>([]);
// Stato per mostrare/nascondere il modal
    const [isModalAperto, setIsModalAperto] = useState(false);

    // Stato per i campi del nuovo indirizzo
    const [nuovoIndirizzo, setNuovoIndirizzo] = useState({
        via: '',
        civico: '',
        citta: '',
        cap: '',
        provincia: '',
        note: ''
    });

    useEffect(() => {
        const scaricaDati = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Chiamata Profilo
                const resProfilo = await axios.get('http://localhost:8084/api/user/profile', config);
                setUtente(resProfilo.data);

                // Chiamata Indirizzi
                const resIndirizzi = await axios.get('http://localhost:8084/api/user/indirizzi', config);
                setIndirizzi(resIndirizzi.data);

            } catch (error) {
                console.error("Errore nel caricamento:", error);
                setErrore("Impossibile caricare i dati.");
            } finally {
                setIsLoading(false);
            }
        };
        if (token) scaricaDati();
    }, [token]);

    const aggiungiIndirizzo = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita il ricaricamento della pagina
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = 'http://localhost:8084/api/user/insert/indirizzo'; // Controlla URL su Swagger

            const response = await axios.post(url, nuovoIndirizzo, config);

            // Se va a buon fine, aggiorniamo la lista locale e chiudiamo il modal
            setIndirizzi([...indirizzi, response.data]);
            setIsModalAperto(false);
            setNuovoIndirizzo({ via: '', civico: '', citta: '', cap: '', provincia: '', note: '' });
            alert("Indirizzo aggiunto con successo! 🏠");
        } catch (err) {
            console.error("Errore aggiunta indirizzo:", err);
            alert("Errore durante l'aggiunta. Riprova.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar setToken={setToken} />

            <div className="p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="h-32 bg-indigo-600"></div>

                    <div className="px-6 py-8 relative">
                        {/* Avatar */}
                        <div className="absolute -top-16 left-6 w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold uppercase">
                                {utente?.nome ? utente.nome.charAt(0) : 'U'}
                            </div>
                        </div>

                        {/* Torna indietro */}
                        <div className="flex justify-end mb-4">
                            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 font-medium transition-colors">
                                Torna indietro
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="mt-8 text-center text-gray-500 py-10 animate-pulse text-lg">
                                Caricamento dati profilo...
                            </div>
                        ) : errore ? (
                            <div className="mt-8 text-center text-red-500 bg-red-50 p-4 rounded-lg">
                                {errore}
                            </div>
                        ) : utente ? (
                            <div className="mt-6">
                                <h2 className="text-3xl font-extrabold text-gray-900">
                                    {utente.nome} {utente.cognome}
                                </h2>
                                <p className="text-gray-500 text-lg mb-8">{utente.email}</p>

                                {/* Dettagli Account */}
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 uppercase tracking-wider text-sm">Dettagli Account</h3>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-400">Nome completo</dt>
                                            <dd className="mt-1 text-base text-gray-900 font-semibold">{utente.nome} {utente.cognome}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-400">Indirizzo Email</dt>
                                            <dd className="mt-1 text-base text-gray-900 font-semibold">{utente.email}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Azione Profilo */}
                                <div className="mt-8">
                                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg">
                                        Modifica Profilo
                                    </button>
                                </div>

                                {/* --- SEZIONE INDIRIZZI --- */}
                                <div className="mt-10 border-t border-gray-100 pt-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">I miei Indirizzi</h3>
                                        <button
                                            onClick={() => setIsModalAperto(true)}
                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md transition-colors"
                                        >
                                            + Aggiungi
                                        </button>
                                    </div>

                                    {indirizzi.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {indirizzi.map((ind) => (
                                                <div key={ind.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors relative group bg-gray-50/50">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xl">📍</span>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {ind.via}, {ind.civico}
                                                            </p>
                                                            <p className="text-gray-600 text-sm">
                                                                {ind.cap} {ind.citta} ({ind.provincia})
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <p className="text-gray-400 text-sm">Non hai ancora salvato nessun indirizzo.</p>
                                        </div>
                                    )}
                                </div>
                                {/* --- FINE SEZIONE INDIRIZZI --- */}

                            </div> // Fine mt-6
                        ) : null}
                    </div> {/* Fine px-6 py-8 */}
                    {/* MODAL PER AGGIUNTA INDIRIZZO */}
                    {isModalAperto && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Nuovo Indirizzo</h3>

                                <form onSubmit={aggiungiIndirizzo} className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Via</label>
                                            <input required type="text" className="w-full border-gray-200 border p-2 rounded-lg"
                                                   value={nuovoIndirizzo.via} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, via: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Civico</label>
                                            <input required type="text" className="w-full border-gray-200 border p-2 rounded-lg"
                                                   value={nuovoIndirizzo.civico} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, civico: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Città</label>
                                            <input required type="text" className="w-full border-gray-200 border p-2 rounded-lg"
                                                   value={nuovoIndirizzo.citta} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, citta: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">CAP</label>
                                            <input required type="text" className="w-full border-gray-200 border p-2 rounded-lg"
                                                   value={nuovoIndirizzo.cap} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, cap: e.target.value})} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Provincia (Sigla)</label>
                                        <input required type="text" maxLength={2} className="w-full border-gray-200 border p-2 rounded-lg uppercase"
                                               value={nuovoIndirizzo.provincia} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, provincia: e.target.value})} />
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button type="button" onClick={() => setIsModalAperto(false)}
                                                className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                            Annulla
                                        </button>
                                        <button type="submit"
                                                className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                                            Salva
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div> {/* Fine card */}
            </div>
        </div>
    );
};

export default Profilo;