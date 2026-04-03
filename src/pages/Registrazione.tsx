import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Phone,
    Calendar,
    Fingerprint,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';

const Registrazione: React.FC = () => {
    const navigate = useNavigate();

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
    const BASE_URL = import.meta.env.VITE_API_URL;

    const gestisciRegistrazione = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrore(null);

        try {
            const url = `${BASE_URL}/api/auth/register`;
            await axios.post(url, formData);
            setSuccesso(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrore("Dati non validi. Il Codice Fiscale o l'Email potrebbero essere già registrati.");
            } else {
                setErrore("Si è verificato un errore durante la registrazione. Riprova più tardi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cf' ? value.toUpperCase() : value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 py-12 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-4xl shadow-2xl shadow-slate-200 p-8 md:p-12 border border-white relative overflow-hidden"
            >
                {/* Decorazione Sfondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />

                <div className="text-center mb-10 relative">
                    <div className="w-16 h-16 bg-linear-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200 text-white font-black text-3xl">
                        Y
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Crea un account</h2>
                    <p className="text-slate-500 font-medium mt-2">Unisciti alla community di Yumaste</p>
                </div>

                <AnimatePresence mode="wait">
                    {successo ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center"
                        >
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Benvenuto a bordo!</h3>
                            <p className="text-emerald-700 font-medium">
                                Registrazione completata. Ti stiamo portando alla pagina di login...
                            </p>
                        </motion.div>
                    ) : (
                        <form onSubmit={gestisciRegistrazione} className="space-y-6">
                            {errore && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {errore}
                                </motion.div>
                            )}

                            {/* NOME & COGNOME */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input required type="text" name="nome" value={formData.nome} onChange={handleChange}
                                               className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                               placeholder="Mario" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Cognome</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input required type="text" name="cognome" value={formData.cognome} onChange={handleChange}
                                               className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                               placeholder="Rossi" />
                                    </div>
                                </div>
                            </div>

                            {/* CF & DATA NASCITA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Codice Fiscale</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input required type="text" name="cf" value={formData.cf} onChange={handleChange}
                                               className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-mono uppercase tracking-widest"
                                               placeholder="RSSMRA..." maxLength={16} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Data di Nascita</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input required type="date" name="dataNascita" value={formData.dataNascita} onChange={handleChange}
                                               className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* TELEFONO & EMAIL */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Telefono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input required type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                                               className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                               placeholder="333 1234567" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange}
                                               className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                               placeholder="mario.rossi@email.com" />
                                    </div>
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input required type="password" name="password" value={formData.password} onChange={handleChange}
                                           className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                           placeholder="••••••••" minLength={6} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all mt-4 flex items-center justify-center gap-2 ${isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Crea Account'}
                            </button>

                            <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-500">
                                    Hai già un account?{' '}
                                    <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4">
                                        Accedi qui
                                    </Link>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="text-slate-400 hover:text-indigo-600 font-bold text-xs transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Torna al catalogo senza registrarti
                                </button>
                            </div>
                        </form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Registrazione;