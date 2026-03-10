import  { useState } from 'react';
// Importiamo i componenti necessari da react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrello from "./pages/Carrello.tsx";
import Profilo from "./pages/Profilo.tsx";
import Ordini from "./pages/Ordini.tsx";
import Registrazione from "./pages/Registrazione.tsx";
import DettaglioBox from "./pages/DettaglioBox.tsx";

// Importiamo i componenti necessari da react-router-dom



export default function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

    // Rimuovo gli useEffect che gestivano lo stato a mano,
    // ora è il Router che gestisce i cambi di pagina!

    return (


    // Il Router "avvolge" tutta la nostra applicazione
        <Router>
            <Routes>
                {/* NUOVA ROTTA: Registrazione */}

                <Route
                    path="/registrazione"
                    element={
                        // Protezione: Se ho già il token, evito che l'utente vada su /registrazione e lo rimando al catalogo
                        token ? <Navigate to="/" /> : <Registrazione />
                    }
                />

                {/* Rotta per la pagina di Login */}
                <Route
                    path="/login"
                    element={
                        // Protezione: Se ho già il token, evito che l'utente vada su /login e lo rimando al catalogo
                        token ? <Navigate to="/" /> : <Login setToken={setToken} />
                    }
                />

                {/* Rotta principale (Catalogo) */}
                <Route
                    path="/"
                    element={<Catalogo token={token} setToken={setToken} />}
                />

                {/* Rotta principale (Carrello) */}
                <Route
                    path="/carrello"
                    element={
                        // Protezione: Se NON ho il token, rimando l'utente al login.
                        // Se ce l'ho, passo sia token che setToken!
                        token ? <Carrello token={token} setToken={setToken} /> : <Navigate to="/login" />
                    }
                />

                {/* Rotta principale (Profilo) */}
                <Route
                    path="/profilo"
                    element={
                        // Protezione: Se NON ho il token, rimando l'utente al login.
                        // Se ce l'ho, passo sia token che setToken!
                        token ? <Profilo token={token} setToken={setToken} /> : <Navigate to="/login" />
                    }
                />

                {/* Rotta principale (Ordini) */}
                <Route
                    path="/ordini"
                    element={
                        // Protezione: Se NON ho il token, rimando l'utente al login.
                        // Se ce l'ho, passo sia token che setToken!
                        token ? <Ordini token={token} setToken={setToken} /> : <Navigate to="/login" />
                    }
                />

                {/* Rotta principale (Dettaglio Box) */}
                <Route
                    path="/box/:id"
                    element={<DettaglioBox token={token} setToken={setToken} />}
                />


                {/* Rotta di fallback: se scrivi un URL sbagliato ti rimando alla home */}
                <Route path="*" element={<Navigate to="/" />} />

            </Routes>
        </Router>
    );
}