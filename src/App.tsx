import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrello from './pages/Carrello.tsx';
import Profilo from './pages/Profilo.tsx';
import Ordini from './pages/Ordini.tsx';
import Registrazione from './pages/Registrazione.tsx';
import DettaglioBox from './pages/DettaglioBox.tsx';
import NotFound from './pages/NotFound.tsx';

export default function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

    return (
        <Router>
            <Routes>
                <Route
                    path="/registrazione"
                    element={token ? <Navigate to="/" /> : <Registrazione />}
                />
                <Route
                    path="/login"
                    element={token ? <Navigate to="/" /> : <Login setToken={setToken} />}
                />
                <Route
                    path="/"
                    element={<Catalogo token={token} setToken={setToken} />}
                />
                <Route
                    path="/carrello"
                    element={token ? <Carrello token={token} setToken={setToken} /> : <Navigate to="/" />}
                />
                <Route
                    path="/profilo"
                    element={token ? <Profilo token={token} setToken={setToken} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/ordini"
                    element={token ? <Ordini token={token} setToken={setToken} /> : <Navigate to="/" />}
                />
                <Route
                    path="/box/:id"
                    element={<DettaglioBox token={token} setToken={setToken} />}
                />

                {/* Pagina 404 personalizzata */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}
