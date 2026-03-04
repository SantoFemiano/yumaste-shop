import React from 'react';

import { useState } from 'react'; // Rimosso l'import di React
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC<{ setToken: (token: string | null) => void }> = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erroreLogin, setErroreLogin] = useState('');
    const [caricamentoLogin, setCaricamentoLogin] = useState(false);
    const navigate = useNavigate(); // Hook per navigare tra le pagine programmaticamente



    const eseguiLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCaricamentoLogin(true);
        setErroreLogin('');

        try {
            const response = await axios.post('http://localhost:8084/api/auth/login', {
                email: email,
                password: password
            });

            const jwtGenerato = response.data.token;
            setToken(jwtGenerato);
            localStorage.setItem('jwt_token', jwtGenerato);

            // Dopo il login con successo, navighiamo l'utente verso il catalogo ("/")
            navigate('/');

        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setErroreLogin(err.response.data.message);
            } else {
                setErroreLogin('Email o password errati. Riprova.');
            }
        } finally {
            setCaricamentoLogin(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full border border-white">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold font-serif text-xl">Y</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Accedi</h1>
                    <p className="text-slate-500">Bentornato! Inserisci i tuoi dati.</p>
                </div>

                {erroreLogin && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <p>{erroreLogin}</p>
                    </div>
                )}

                <form onSubmit={eseguiLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700 block">Password</label>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={caricamentoLogin}
                        className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all mt-2 ${
                            caricamentoLogin
                                ? 'bg-indigo-400 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                    >
                        {caricamentoLogin ? 'Accesso in corso...' : 'Entra nel Negozio'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Login;