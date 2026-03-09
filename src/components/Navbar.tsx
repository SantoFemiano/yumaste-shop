import React from 'react';
import { useNavigate } from "react-router-dom";

const Navbar: React.FC<{ setToken: (token: string | null) => void }> = ({ setToken }) => {
    const navigate = useNavigate();

    const eseguiLogout = () => {
        setToken(null);
        localStorage.removeItem('jwt_token');
        // Navighiamo forzatamente verso il login al logout
        navigate('/login');
    };




    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
            {/* Sezione Logo e Titolo */}
            <div
                onClick={() => navigate('/')}
                className="flex items-center gap-3 cursor-pointer group"
            >
                {/* Il tuo Logo */}
                <div>
                    <img
                        src="src/favIcon/yumaste_icon.svg"
                        className="w-10 h-10" alt="Logo"
                    />
                </div>

                {/* Titolo */}
                <h1 className="text-2xl font-bold tracking-wide group-hover:text-gray-300 transition-colors duration-200">
                    Yumaste
                </h1>
            </div>

            <div className="flex items-center gap-4">
            <button
                onClick={eseguiLogout}
                id="logoutbotton"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
                Disconnetti
            </button>

            <button
                onClick={() => navigate('/carrello')}
                id="carrellobotton"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
                Carrello
            </button>
            <button
                onClick={() => navigate('/profilo')}
                id="profilobotton"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
                Profilo
            </button>
            <button
                onClick={() => navigate('/ordini')}
                id="ordinibotton"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
                Ordini
            </button>
</div>
        </nav>

    );
};

export default Navbar;