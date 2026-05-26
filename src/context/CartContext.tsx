import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

interface CartContextType {
    boxDistinte: number;
    refreshCart: (token: string) => Promise<void>;
    incrementaLocale: () => void;
}

const CartContext = createContext<CartContextType>({
    boxDistinte: 0,
    refreshCart: async () => {},
    incrementaLocale: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode; token: string | null }> = ({ children, token }) => {
    const [boxDistinte, setBoxDistinte] = useState(0);

    // Carica il conteggio reale dal server
    const refreshCart = useCallback(async (tkn: string) => {
        try {
            const res = await axios.get(`${BASE_URL}/api/user/cart`, {
                headers: { Authorization: `Bearer ${tkn}` },
            });
            const items = res.data?.items;
            setBoxDistinte(Array.isArray(items) ? items.length : 0);
        } catch {
            // silenzioso
        }
    }, []);

    // Aggiornamento ottimistico: incrementa subito +1 senza aspettare il server
    const incrementaLocale = useCallback(() => {
        setBoxDistinte(prev => prev + 1);
    }, []);

    // Carica al mount se c'è già un token
    React.useEffect(() => {
        if (token) refreshCart(token);
    }, [token, refreshCart]);

    return (
        <CartContext.Provider value={{ boxDistinte, refreshCart, incrementaLocale }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
