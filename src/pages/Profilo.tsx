import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    MapPin,
    Lock,
    ChevronLeft,
    Camera,
    CheckCircle2,
    Loader2,
    X,
    LogOut,
    AlertTriangle
} from 'lucide-react';

import Navbar from '../components/Navbar';

interface DatiUtente {
    nome: string;
    cognome: string;
    email: string;
}

interface Indirizzo {
    id: number;
    via: string;
    citta: string;
    cap: string;
    civico: string;
    provincia: string;
}

const Profilo: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [utente, setUtente] = useState<DatiUtente | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const [indirizzi, setIndirizzi] = useState<Indirizzo[]>([]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [datiModifica, setDatiModifica] = useState<DatiUtente | null>(null);
    const [isModalAperto, setIsModalAperto] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({ vecchiaPassword: '', nuovaPassword: '', confermaPassword: '' });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [nuovoIndirizzo, setNuovoIndirizzo] = useState({ via: '', civico: '', citta: '', cap: '', provincia: '', note: '' });

    useEffect(() => {
        const scaricaDati = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [resProfilo, resIndirizzi] = await Promise.all([
                    axios.get('http://localhost:8084/api/user/profile', config),
                    axios.get('http://localhost:8084/api/user/indirizzi', config)
                ]);
                setUtente(resProfilo.data);
                setIndirizzi(resIndirizzi.data);
            } catch {
                setErrore("Impossibile caricare i dati del profilo.");
            } finally {
                setIsLoading(false);
            }
        };
        if (token) {
            void scaricaDati();
        }
    }, [token]);

    const salvaModificheProfilo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!datiModifica || !utente) return;
        const emailCambiata = datiModifica.email !== utente.email;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put('http://localhost:8084/api/user/update/profilo', datiModifica, config);
            if (emailCambiata) {
                window.alert("Email aggiornata! Effettua di nuovo il login.");
                setToken(null);
                localStorage.removeItem('jwt_token');
                navigate('/login');
            } else {
                setUtente(response.data);
                setIsEditingProfile(false);
            }
        } catch {
            window.alert("Errore durante l'aggiornamento.");
        }
    };

    const salvaNuovaPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.nuovaPassword !== passwordData.confermaPassword) {
            window.alert("Le password non coincidono!");
            return;
        }
        setIsPasswordLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put('http://localhost:8084/api/user/update/profilo/password', {
                vecchiaPassword: passwordData.vecchiaPassword,
                nuovaPassword: passwordData.nuovaPassword
            }, config);
            window.alert("Password aggiornata! 🔒");
            setIsEditingPassword(false);
            setPasswordData({ vecchiaPassword: '', nuovaPassword: '', confermaPassword: '' });
        } catch {
            window.alert("Password attuale errata o errore di sistema.");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const aggiungiIndirizzo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post('http://localhost:8084/api/user/insert/indirizzo', nuovoIndirizzo, config);
            setIndirizzi([...indirizzi, response.data]);
            setIsModalAperto(false);
            setNuovoIndirizzo({ via: '', civico: '', citta: '', cap: '', provincia: '', note: '' });
        } catch {
            window.alert("Errore aggiunta indirizzo.");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
            <Navbar token={token} setToken={setToken} />

            <main className="max-w-4xl mx-auto px-6 pt-8">
                {errore && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 border border-red-100">
                        <AlertTriangle className="w-5 h-5" /> {errore}
                    </div>
                )}

                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 font-bold transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Torna indietro
                </button>

                <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200 overflow-hidden border border-white">
                    {/* Header Profilo */}
                    <div className="h-48 bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-500 relative">
                        <div className="absolute -bottom-16 left-10 p-1.5 bg-white rounded-4xl shadow-xl">
                            <div className="w-32 h-32 bg-slate-100 rounded-3xl flex items-center justify-center text-indigo-600 relative group cursor-pointer">
                                <span className="text-5xl font-black">{utente?.nome?.charAt(0)}</span>
                                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Camera className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-10 pb-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {utente?.nome} {utente?.cognome}
                                </h1>
                                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" /> {utente?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => { setToken(null); navigate('/login'); }}
                                className="px-4 py-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 font-bold flex items-center transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </button>
                        </div>

                        <div className="my-10 h-px bg-slate-100 w-full" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* COLONNA SINISTRA: DATI PERSONALI */}
                            <section className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-indigo-600" /> Info Personali
                                    </h3>
                                    {!isEditingProfile && (
                                        <button onClick={() => { setDatiModifica(utente); setIsEditingProfile(true); }} className="text-indigo-600 font-bold hover:underline">
                                            Modifica
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {isEditingProfile ? (
                                        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={salvaModificheProfilo} className="space-y-4 bg-slate-50 p-6 rounded-3xl">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                                                    <input value={datiModifica?.nome} onChange={e => setDatiModifica({...datiModifica!, nome: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Cognome</label>
                                                    <input value={datiModifica?.cognome} onChange={e => setDatiModifica({...datiModifica!, cognome: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                                </div>
                                            </div>
                                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Salva</button>
                                            <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full py-2 text-slate-500 font-bold">Annulla</button>
                                        </motion.form>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Nome Completo</p>
                                                <p className="font-bold text-slate-800 text-lg">{utente?.nome} {utente?.cognome}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Stato Account</p>
                                                <p className="font-bold text-emerald-600 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" /> Verificato & Attivo
                                                </p>
                                            </div>

                                            <button
                                                className="w-full h-14 rounded-2xl border border-slate-200 font-bold flex items-center px-6 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsEditingPassword(!isEditingPassword)}
                                            >
                                                <Lock className="w-4 h-4 mr-3 text-slate-400" />
                                                {isEditingPassword ? "Chiudi Modifica Password" : "Cambia Password"}
                                            </button>

                                            <AnimatePresence>
                                                {isEditingPassword && (
                                                    <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={salvaNuovaPassword} className="space-y-4 overflow-hidden">
                                                        <input type="password" placeholder="Password attuale" className="w-full p-3 rounded-xl border border-slate-200" required onChange={e => setPasswordData({...passwordData, vecchiaPassword: e.target.value})} />
                                                        <input type="password" placeholder="Nuova password" className="w-full p-3 rounded-xl border border-slate-200" required onChange={e => setPasswordData({...passwordData, nuovaPassword: e.target.value})} />
                                                        <input type="password" placeholder="Conferma password" className="w-full p-3 rounded-xl border border-slate-200" required onChange={e => setPasswordData({...passwordData, confermaPassword: e.target.value})} />
                                                        <button disabled={isPasswordLoading} className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center">
                                                            {isPasswordLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Aggiorna Password"}
                                                        </button>
                                                    </motion.form>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </section>

                            {/* COLONNA DESTRA: INDIRIZZI */}
                            <section className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-indigo-600" /> Indirizzi Consegna
                                    </h3>
                                    <button onClick={() => setIsModalAperto(true)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">
                                        + Aggiungi
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {indirizzi.length > 0 ? (
                                        indirizzi.map((ind) => (
                                            <div key={ind.id} className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm flex items-start gap-4">
                                                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{ind.via}, {ind.civico}</p>
                                                    <p className="text-sm font-medium text-slate-500">{ind.cap} {ind.citta} ({ind.provincia})</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400">
                                            Nessun indirizzo salvato.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL INDIRIZZO */}
            <AnimatePresence>
                {isModalAperto && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalAperto(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-4xl shadow-2xl relative z-10 p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-slate-900">Nuovo Indirizzo</h3>
                                <button onClick={() => setIsModalAperto(false)} className="p-2 rounded-full hover:bg-slate-100"><X /></button>
                            </div>
                            <form onSubmit={aggiungiIndirizzo} className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <input placeholder="Via" required className="col-span-3 p-3 rounded-xl border border-slate-200" value={nuovoIndirizzo.via} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, via: e.target.value})} />
                                    <input placeholder="Civico" required className="p-3 rounded-xl border border-slate-200" value={nuovoIndirizzo.civico} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, civico: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Città" required className="p-3 rounded-xl border border-slate-200" value={nuovoIndirizzo.citta} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, citta: e.target.value})} />
                                    <input placeholder="CAP" required className="p-3 rounded-xl border border-slate-200" value={nuovoIndirizzo.cap} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, cap: e.target.value})} />
                                </div>
                                <input placeholder="Provincia (es. MI)" required maxLength={2} className="w-24 p-3 rounded-xl border border-slate-200 uppercase" value={nuovoIndirizzo.provincia} onChange={e => setNuovoIndirizzo({...nuovoIndirizzo, provincia: e.target.value.toUpperCase()})} />
                                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200">Salva</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profilo;