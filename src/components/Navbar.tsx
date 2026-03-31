import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoUrl from '../favIcon/yumaste_icon.svg';
import {
    Search,
    ShoppingCart,
    User,
    ClipboardList,
    LogOut,
    X,
    LogIn,
    UserPlus
} from "lucide-react";

// Import componenti shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [termineRicerca, setTermineRicerca] = useState('');

    const eseguiLogout = () => {
        setToken(null);
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    const gestisciRicerca = (e: React.FormEvent) => {
        e.preventDefault();
        if (termineRicerca.trim() !== '') {
            navigate(`/?search=${encodeURIComponent(termineRicerca)}`);
        } else {
            navigate(`/`);
        }
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 text-white shadow-xl sticky top-0 z-50 backdrop-blur-md bg-opacity-95"
        >
            {/* LOGO */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
                <img src={logoUrl} className="w-9 h-9" alt="Logo" />
                <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
                    YUMASTE
                </h1>
            </motion.div>

            {/* RICERCA CON SHADCN + FRAMER MOTION */}
            <div className="flex-1 max-w-xl mx-4 lg:mx-12">
                <form onSubmit={gestisciRicerca} className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Cerca una box deliziosa..."
                        value={termineRicerca}
                        onChange={(e) => setTermineRicerca(e.target.value)}
                        className="w-full pl-10 pr-10 bg-slate-800 border-slate-700 text-slate-100 rounded-full focus-visible:ring-indigo-500 focus-visible:ring-offset-0 placeholder:text-slate-500 h-10 transition-all"
                    />
                    <AnimatePresence>
                        {termineRicerca && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                type="button"
                                onClick={() => { setTermineRicerca(''); navigate('/'); }}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </form>
            </div>

            {/* BOTTONI AZIONE */}
            <div className="flex items-center gap-2 shrink-0">
                {token ? (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/carrello')}
                            className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full"
                        >
                            <ShoppingCart className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline font-bold">Carrello</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/ordini')}
                            className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full hidden md:flex"
                        >
                            <ClipboardList className="w-5 h-5 mr-2" />
                            <span className="font-bold">Ordini</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/profilo')}
                            className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full hidden md:flex"
                        >
                            <User className="w-5 h-5 mr-2" />
                            <span className="font-bold">Profilo</span>
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={eseguiLogout}
                            className="rounded-full font-bold ml-2 shadow-lg shadow-red-900/20"
                        >
                            <LogOut className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Esci</span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/login')}
                            className="text-slate-300 hover:text-white font-bold"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Accedi
                        </Button>
                        <Button
                            onClick={() => navigate('/registrazione')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg shadow-indigo-500/20"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Inizia
                        </Button>
                    </>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;