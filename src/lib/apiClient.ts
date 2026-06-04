import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084',
});

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
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('Refresh token mancante');
                }

                const refreshResponse = await axios.post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const newAccessToken = refreshResponse.data.token;

                // Salva il nuovo access token usando il TUO nome originale
                localStorage.setItem('jwt_token', newAccessToken);

                // Aggiorna l'header e riprova la chiamata
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                console.error('Sessione scaduta. Logout forzato.');
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;