import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center overflow-hidden relative">

            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Numero 404 animato — animate inline per evitare conflitti di tipo Variants */}
            <motion.div
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
                className="relative mb-4 select-none"
            >
                <span className="text-[10rem] md:text-[14rem] font-black text-slate-100 leading-none tracking-tighter">
                    404
                </span>
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ rotate: -8 }}
                    animate={{ rotate: 8 }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const }}
                >
                    <ShoppingBag className="w-20 h-20 md:w-28 md:h-28 text-primary/30" strokeWidth={1.2} />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-md"
            >
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    Pagina non trovata
                </h1>
                <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed">
                    Sembra che questa box non esista nel nostro menu.{' '}
                    <br className="hidden md:block" />
                    Torna al catalogo e trova qualcosa di buono!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => navigate('/')}
                        size="lg"
                        className="h-14 px-8 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Torna alla Home
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        size="lg"
                        className="h-14 px-8 rounded-2xl text-base font-bold border-2 hover:scale-105 transition-transform"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Sfoglia il Catalogo
                    </Button>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-8 text-slate-400 text-sm font-medium"
            >
                Yumaste © {new Date().getFullYear()}
            </motion.p>
        </div>
    );
};

export default NotFound;
