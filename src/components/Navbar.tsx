import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Navbar: React.FC<{ token: string | null; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
    const navigate = useNavigate();

    // STATO PER LA RICERCA
    const [termineRicerca, setTermineRicerca] = useState('');

    const eseguiLogout = () => {
        setToken(null);
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    // FUNZIONE PER ESEGUIRE LA RICERCA
    const gestisciRicerca = (e: React.FormEvent) => {
        e.preventDefault(); // Evita che la pagina si ricarichi
        if (termineRicerca.trim() !== '') {
            // Se c'è del testo, andiamo al catalogo aggiungendo ?search=... all'URL
            navigate(`/?search=${encodeURIComponent(termineRicerca)}`);
        } else {
            // Se la ricerca è vuota, torniamo al catalogo normale
            navigate(`/`);
        }
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md sticky top-0 z-50">

            {/* Sezione Logo e Titolo (SINISTRA) */}
            <div
                onClick={() => navigate('/')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
                <div>
                    <img
                        src="src/favIcon/yumaste_icon.svg"
                        className="w-10 h-10" alt="Logo"
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-wide group-hover:text-gray-300 transition-colors duration-200 hidden sm:block">
                    Yumaste
                </h1>
            </div>

            {/* BARRA DI RICERCA (CENTRO) */}
            <div className="flex-1 max-w-xl mx-4 lg:mx-12">
                <form onSubmit={gestisciRicerca} className="relative">
                    <input
                        type="text"
                        placeholder="Cerca una box..."
                        value={termineRicerca}
                        onChange={(e) => setTermineRicerca(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400 transition-all shadow-inner"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔍</span>
                    </div>
                    {/* Tasto "X" per svuotare la ricerca velocemente */}
                    {termineRicerca && (
                        <button
                            type="button"
                            onClick={() => {
                                setTermineRicerca('');
                                navigate('/');
                            }}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </form>
            </div>

            {/* Sezione Bottoni (DESTRA) */}
            <div className="flex items-center gap-3 shrink-0">
                {token ? (
                    <>
                        <button
                            onClick={() => navigate('/carrello')}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
                        >
                            <span className="hidden md:inline">Carrello</span> 🛒
                        </button>
                        <button
                            onClick={() => navigate('/profilo')}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 hidden md:block"
                        >
                            Profilo
                        </button>
                        <button
                            onClick={() => navigate('/ordini')}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 hidden md:block"
                        >
                            Ordini
                        </button>
                        <button
                            onClick={eseguiLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            Esci
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 bg-transparent border border-gray-400 hover:border-white hover:text-white text-gray-300 font-semibold rounded-lg transition-colors duration-200"
                        >
                            Accedi
                        </button>
                        <button
                            onClick={() => navigate('/registrazione')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
                        >
                            Registrati
                        </button>
                    </>
                )}
            </div>

        </nav>
    );
};

export default Navbar;