import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    LogIn,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';

const Login: React.FC<{ setToken: (token: string | null) => void }> = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erroreLogin, setErroreLogin] = useState('');
    const [caricamentoLogin, setCaricamentoLogin] = useState(false);
    const navigate = useNavigate();

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
            navigate('/');

        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setErroreLogin(err.response.data.message);
            } else {
                setErroreLogin('Credenziali non valide. Controlla email e password.');
            }
        } finally {
            setCaricamentoLogin(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 md:p-12 rounded-4xl shadow-2xl shadow-slate-200 max-w-md w-full border border-white relative overflow-hidden"
            >
                {/* Decorazione Sfondo */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-50 rounded-full -ml-12 -mt-12 opacity-50" />

                <div className="text-center mb-10 relative">
                    <div className="w-16 h-16 bg-linear-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100">
                        <span className="text-white font-black text-3xl">Y</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bentornato</h1>
                    <p className="text-slate-500 font-medium mt-2">Accedi per gestire i tuoi ordini Yumaste</p>
                </div>

                {erroreLogin && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{erroreLogin}</p>
                    </motion.div>
                )}

                <form onSubmit={eseguiLogin} className="space-y-6 relative">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={caricamentoLogin}
                        className={`w-full h-14 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 ${
                            caricamentoLogin
                                ? 'bg-indigo-400 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                        }`}
                    >
                        {caricamentoLogin ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Accedi
                            </>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-500">
                            Non hai un account?{' '}
                            <Link to="/registrazione" className="text-indigo-600 font-black hover:underline underline-offset-4">
                                Registrati ora
                            </Link>
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-slate-400 hover:text-indigo-600 font-bold text-xs transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-3 h-3" /> Torna al catalogo
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;