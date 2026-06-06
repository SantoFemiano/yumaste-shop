import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084',
});

// Variabili per gestire la concorrenza (chiamate simultanee con token scaduto)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

// Funzione per risolvere o rigettare tutte le chiamate messe in coda
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Aggiunge l'Access Token (jwt_token) a ogni richiesta
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token'); // Usa il nome originale
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercetta gli errori 401/403 per il refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if ((error.response?.status === 403 || error.response?.status === 401) && !originalRequest._retry) {

            // Se c'è già un refresh in corso, metto la chiamata in coda e aspetto
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            // Blocco le altre chiamate
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('Refresh token mancante');
                }

                const refreshResponse = await axios.post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const newAccessToken = refreshResponse.data.token;
                const returnedRefreshToken = refreshResponse.data.refreshToken;

                // Salva il nuovo access token e aggiorna il refresh token
                localStorage.setItem('jwt_token', newAccessToken);
                localStorage.setItem('refreshToken', returnedRefreshToken);

                // Il refresh è andato a buon fine: sblocco tutte le chiamate in coda passandogli il nuovo token
                processQueue(null, newAccessToken);

                // Aggiorna l'header e riprova la chiamata originale
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                // Il refresh è fallito: faccio fallire tutte le chiamate in coda
                processQueue(refreshError, null);

                console.error('Sessione scaduta. Logout forzato.');
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                // Sblocco il flag per futuri refresh
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;