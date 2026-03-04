import React from 'react';

import {useNavigate} from "react-router-dom";

const Navbar: React.FC<{ setToken: (token: string | null) => void }> = ({ setToken }) => {
    const navigate = useNavigate();

    const eseguiLogout = () => {
        setToken(null);
        localStorage.removeItem('jwt_token');
        // Navighiamo forzatamente verso il login al logout
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold font-serif">Y</span>
                </div>
                <h1 className="text-2xl font-bold text-indigo-900 tracking-tight cursor-pointer" onClick={() => navigate('/')}>
                    Yumaste
                </h1>
            </div>

            <button
                onClick={eseguiLogout}
                className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
            >
                Disconnetti
            </button>
        </nav>
    );
};

export default Navbar;
