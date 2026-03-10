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
    // Stati per modifica profili
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [datiModifica, setDatiModifica] = useState<DatiUtente | null>(null);
// Stato per mostrare/nascondere il modal (inserimento indirizzi)
    const [isModalAperto, setIsModalAperto] = useState(false);
    // Stati per il cambio password
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        vecchiaPassword: '',
        nuovaPassword: '',
        confermaPassword: ''
    });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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

    const iniziaModificaProfilo = () => {
        setDatiModifica(utente); // Copia i dati attuali nel form di modifica
        setIsEditingProfile(true);
    };

    const salvaModificheProfilo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!datiModifica || !utente) return;

        // Capiamo se l'email sta per essere cambiata
        const emailCambiata = datiModifica.email !== utente.email;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = 'http://localhost:8084/api/user/update/profilo';

            const response = await axios.put(url, datiModifica, config);

            if (emailCambiata) {
                // SE L'EMAIL È CAMBIATA:
                alert("Email aggiornata con successo! Per sicurezza, effettua di nuovo l'accesso.");
                setToken(null);
                localStorage.removeItem('jwt_token');
                navigate('/login'); // Lo rimandiamo al login
            } else {
                // SE HA CAMBIATO SOLO IL NOME/COGNOME:
                setUtente(response.data);
                setIsEditingProfile(false);
                alert("Profilo aggiornato con successo!");
            }

        } catch (error) {
            console.error("Errore durante l'aggiornamento del profilo:", error);
            alert("Errore durante l'aggiornamento. Riprova.");
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (datiModifica) {
            setDatiModifica({
                ...datiModifica,
                [e.target.name]: e.target.value
            });
        }
    };

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

    const salvaNuovaPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Controllo frontend: le due nuove password sono uguali?
        if (passwordData.nuovaPassword !== passwordData.confermaPassword) {
            alert("La nuova password e la conferma non coincidono!");
            return;
        }

        setIsPasswordLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = 'http://localhost:8084/api/user/update/profilo/password';

            // Inviamo solo vecchia e nuova password (la conferma serve solo lato frontend)
            const payload = {
                vecchiaPassword: passwordData.vecchiaPassword,
                nuovaPassword: passwordData.nuovaPassword
            };

            await axios.put(url, payload, config);

            alert("Password aggiornata con successo!");
            setIsEditingPassword(false);

            // Puliamo i campi per sicurezza
            setPasswordData({ vecchiaPassword: '', nuovaPassword: '', confermaPassword: '' });

        } catch (error) {
            console.error("Errore cambio password:", error);

            // 1. Controlliamo se è un errore generato da Axios
            // 2. Leggiamo lo status DALL'ERRORE (error.response?.status)
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                alert("La password attuale non è corretta.");
            } else {
                alert("Errore durante l'aggiornamento della password.");
            }
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar token={token} setToken={setToken} />

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

                                    {isEditingProfile ? (
                                        // MODALITÀ MODIFICA (FORM)
                                        <form onSubmit={salvaModificheProfilo} className="space-y-4 max-w-md">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                                                    <input required type="text" name="nome" value={datiModifica?.nome || ''} onChange={handleProfileChange}
                                                           className="w-full border-gray-300 border p-2 rounded-lg" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cognome</label>
                                                    <input required type="text" name="cognome" value={datiModifica?.cognome || ''} onChange={handleProfileChange}
                                                           className="w-full border-gray-300 border p-2 rounded-lg" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                                {/* Di solito l'email non si fa cambiare facilmente per questioni di sicurezza, valuta se renderla readonly */}
                                                <input required type="email" name="email" value={datiModifica?.email || ''} onChange={handleProfileChange}
                                                       className="w-full border-gray-300 border p-2 rounded-lg" readOnly={false} />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button type="button" onClick={() => setIsEditingProfile(false)}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                                                    Annulla
                                                </button>
                                                <button type="submit"
                                                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow">
                                                    Salva
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        // MODALITÀ VISUALIZZAZIONE
                                        <>
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

                                            {/* ZONA BOTTONI */}
                                            <div className="mt-8 flex flex-wrap gap-4">
                                                <button onClick={iniziaModificaProfilo} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg">
                                                    Modifica Profilo
                                                </button>

                                                {/* NUOVO BOTTONE CAMBIA PASSWORD */}
                                                <button
                                                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                                                    className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold rounded-lg transition-all shadow-sm"
                                                >
                                                    {isEditingPassword ? 'Annulla Cambio Password' : 'Cambia Password'}
                                                </button>
                                            </div>

                                            {/* FORM CAMBIO PASSWORD A TENDINA */}
                                            {isEditingPassword && (
                                                <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-xl max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                        <span>🔒</span> Aggiorna Password
                                                    </h4>
                                                    <form onSubmit={salvaNuovaPassword} className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password Attuale</label>
                                                            <input required type="password" value={passwordData.vecchiaPassword}
                                                                   onChange={(e) => setPasswordData({...passwordData, vecchiaPassword: e.target.value})}
                                                                   className="w-full border-gray-300 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nuova Password</label>
                                                            <input required type="password" minLength={6} value={passwordData.nuovaPassword}
                                                                   onChange={(e) => setPasswordData({...passwordData, nuovaPassword: e.target.value})}
                                                                   className="w-full border-gray-300 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conferma Nuova Password</label>
                                                            <input required type="password" minLength={6} value={passwordData.confermaPassword}
                                                                   onChange={(e) => setPasswordData({...passwordData, confermaPassword: e.target.value})}
                                                                   className="w-full border-gray-300 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                                        </div>
                                                        <div className="pt-2">
                                                            <button
                                                                type="submit"
                                                                disabled={isPasswordLoading}
                                                                className={`w-full py-2.5 text-white font-bold rounded-lg transition-colors shadow flex items-center justify-center ${isPasswordLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                                                            >
                                                                {isPasswordLoading ? 'Aggiornamento in corso...' : 'Salva Nuova Password'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </>
                                    )}
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