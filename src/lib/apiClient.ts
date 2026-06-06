import axios, { AxiosError } from 'axios';

// 2. Definisci l'interfaccia per gli oggetti nella coda
interface FailedQueueItem {
    resolve: (token: string) => void;
    reject: (error: AxiosError) => void;
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084',
});

let isRefreshing = false;
// 3. Usa l'interfaccia invece di "any"
let failedQueue: FailedQueueItem[] = [];

// 4. Tipizza i parametri della funzione
const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Aggiunge l'Access Token (jwt_token) a ogni richiesta
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
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

                // Il refresh è andato a buon fine: sblocco tutte le chiamate in coda
                processQueue(null, newAccessToken);

                // Aggiorna l'header e riprova la chiamata originale
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {

                const error = refreshError as AxiosError;

                // Il refresh è fallito: faccio fallire tutte le chiamate in coda
                processQueue(error, null);

                console.error('Sessione scaduta. Logout forzato.');
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';

                // Restituiamo l'errore castato
                return Promise.reject(error);
            } finally {
                // Sblocco il flag per futuri refresh
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    } // fine callback async
); // <--- QUESTA ERA LA PARENTESI MANCANANTE (chiude il .use)

export default apiClient;