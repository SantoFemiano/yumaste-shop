import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const OAuth2RedirectHandler: React.FC<{ setToken: (token: string | null) => void }> = ({ setToken }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Estrai il token dai query parameters (?token=...)
        const token = searchParams.get('token');

        if (token) {
            // Salva il token nello stato globale e nel localStorage
            setToken(token);
            localStorage.setItem('jwt_token', token);

            // Reindirizza l'utente alla dashboard/catalogo
            navigate('/');
        } else {
            // Se non c'è il token, c'è stato un errore. Torna al login
            navigate('/login', { state: { error: "Autenticazione OAuth fallita" } });
        }
    }, [searchParams, navigate, setToken]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Completamento dell'accesso in corso...</h2>
            <p className="text-slate-500 mt-2">Verrai reindirizzato a breve.</p>
        </div>
    );
};

export default OAuth2RedirectHandler;