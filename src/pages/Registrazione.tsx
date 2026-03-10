import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Registrazione: React.FC = () => {
    const navigate = useNavigate();

    // 1. STATI DEL FORM AGGIORNATI CON IL TUO SWAGGER
    const [formData, setFormData] = useState({
        cf: '',
        nome: '',
        cognome: '',
        dataNascita: '',
        telefono: '',
        email: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);
    const [successo, setSuccesso] = useState(false);

    // 2. GESTIONE DELL'INVIO
    const gestisciRegistrazione = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrore(null);

        try {
            const url = 'http://localhost:8084/api/auth/register';

            // Invia i dati esattamente come si aspetta Spring Boot
            await axios.post(url, formData);

            setSuccesso(true);

            // Dopo 2.5 secondi, rimandiamo l'utente al Login
            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (error) {
            console.error("Errore di registrazione:", error);

            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrore("Dati non validi, Codice Fiscale o Email forse già in uso.");
            } else {
                setErrore("Errore del server. Verifica i dati e riprova.");
            }
        } finally {
            setIsLoading(false);
        }
    }; // <--- AGGIUNTA PARENTESI MANCANTE QUI

    // 3. GESTIONE CAMBIAMENTO INPUT
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-10">

            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-bold text-3xl">
                        Y
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Crea un account</h2>
                    <p className="text-slate-500 mt-2">Unisciti a Yumaste e ordina le tue box</p>
                </div>

                {successo ? (
                    <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center font-medium border border-green-200">
                        <span className="text-4xl block mb-2">🎉</span>
                        Registrazione completata con successo! <br />
                        <span className="text-sm font-normal text-green-600 mt-2 block">Ti stiamo reindirizzando al login...</span>
                    </div>
                ) : (
                    <form onSubmit={gestisciRegistrazione} className="space-y-5">
                        {errore && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                                {errore}
                            </div>
                        )}

                        {/* RIGA 1: Nome e Cognome */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nome</label>
                                <input required type="text" name="nome" value={formData.nome} onChange={handleChange}
                                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                       placeholder="Mario" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Cognome</label>
                                <input required type="text" name="cognome" value={formData.cognome} onChange={handleChange}
                                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                       placeholder="Rossi" />
                            </div>
                        </div>

                        {/* RIGA 2: Codice Fiscale e Data di Nascita */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Codice Fiscale</label>
                                <input required type="text" name="cf" value={formData.cf} onChange={handleChange}
                                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all uppercase"
                                       placeholder="RSSMRA..." maxLength={16} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Data di Nascita</label>
                                <input required type="date" name="dataNascita" value={formData.dataNascita} onChange={handleChange}
                                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                            </div>
                        </div>

                        {/* RIGA 3: Telefono e Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Telefono</label>
                                <input required type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                       placeholder="333 1234567" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange}
                                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                       placeholder="mario.rossi@email.com" />
                            </div>
                        </div>

                        {/* RIGA 4: Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                            <input required type="password" name="password" value={formData.password} onChange={handleChange}
                                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                   placeholder="••••••••" minLength={6} />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-md transition-all mt-4 ${isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
                        >
                            {isLoading ? 'Registrazione in corso...' : 'Registrati'}
                        </button>

                        <div className="text-center text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">
                            Hai già un account?{' '}
                            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                                Accedi qui
                            </Link>
                        </div>
                        {/* ---TORNA AL CATALOGO --- */}
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <span>&larr;</span> Esplora il catalogo senza registrarti
                            </button>
                        </div>
                        {/* ---------------------------------------- */}

                    </form>
                )}
            </div>
        </div>
    );
};

export default Registrazione;