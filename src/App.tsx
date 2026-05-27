import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrello from './pages/Carrello';
import Profilo from './pages/Profilo';
import Ordini from './pages/Ordini';
import Registrazione from './pages/Registrazione';
import DettaglioBox from './pages/DettaglioBox';
import NotFound from './pages/NotFound';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'; // <-- IMPORT AGGIUNTO
import { CartProvider } from './context/CartContext';

export default function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

    return (
        <CartProvider token={token}>
            <Router>
                <Routes>
                    <Route path="/registrazione" element={token ? <Navigate to="/" /> : <Registrazione />} />
                    <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />

                    {/* NUOVA ROTTA: Gestisce il ritorno dal backend dopo il login con GitHub */}
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler setToken={setToken} />} />

                    <Route path="/" element={<Catalogo token={token} setToken={setToken} />} />
                    <Route path="/carrello" element={token ? <Carrello token={token} setToken={setToken} /> : <Navigate to="/" />} />
                    <Route path="/profilo" element={token ? <Profilo token={token} setToken={setToken} /> : <Navigate to="/login" />} />
                    <Route path="/ordini" element={token ? <Ordini token={token} setToken={setToken} /> : <Navigate to="/" />} />
                    <Route path="/box/:id" element={<DettaglioBox token={token} setToken={setToken} />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </CartProvider>
    );
}