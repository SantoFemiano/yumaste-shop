# 🛒 Yumaste Shop

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-4-black)](https://ui.shadcn.com/)

Frontend dello shop dedicato ai clienti della piattaforma **Yumaste** — un'applicazione web per la navigazione del catalogo box alimentari, la gestione del carrello, degli ordini e del profilo utente.

> 🔗 Si interfaccia con il backend REST [yumaste-backend](https://github.com/SantoFemiano/yumaste-backend) tramite chiamate HTTP autenticate con JWT.

---

## 📋 Indice

- [Panoramica](#-panoramica)
- [Stack Tecnologico](#-stack-tecnologico)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Pagine e Routing](#-pagine-e-routing)
- [Autenticazione](#-autenticazione)
- [Connessione al Backend](#-connessione-al-backend)
- [Variabili d'Ambiente](#-variabili-dambiente)
- [Avvio del Progetto](#-avvio-del-progetto)
- [Build di Produzione](#-build-di-produzione)

---

## 📖 Panoramica

Yumaste Shop è la SPA (Single Page Application) client-facing della piattaforma Yumaste. Permette agli utenti di:

- Sfogliare il **catalogo** delle box alimentari disponibili
- Visualizzare il **dettaglio** di ogni box con ingredienti e valori nutrizionali
- Aggiungere box al **carrello** e gestirne la quantità
- Effettuare **ordini** e consultare lo storico
- Gestire il proprio **profilo** e gli indirizzi di consegna
- **Registrarsi** e fare il **login** con autenticazione JWT

---

## 🛠️ Stack Tecnologico

| Tecnologia | Versione | Scopo |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 5.9 | Tipizzazione statica |
| Vite | 7 | Build tool e dev server |
| React Router DOM | 7 | Routing client-side |
| TailwindCSS | 4 | Utility-first CSS framework |
| shadcn/ui | 4 | Componenti UI accessibili |
| Radix UI | 1.4 | Primitivi UI headless |
| Framer Motion | 12 | Animazioni |
| Axios | 1.x | Client HTTP per le chiamate API |
| Lucide React | 0.577 | Libreria icone |
| class-variance-authority | 0.7 | Gestione varianti classi CSS |
| Geist Font | 5.x | Font variabile |
| ESLint | 9 | Linting del codice |

---

## 🏗️ Struttura del Progetto

```
src/
├── App.tsx                  # Router principale e gestione token JWT
├── main.tsx                 # Entry point React
├── index.css                # Stili globali (Tailwind + variabili CSS)
├── pages/                   # Pagine dell'applicazione
│   ├── Login.tsx            # Pagina di login
│   ├── Registrazione.tsx    # Pagina di registrazione
│   ├── Catalogo.tsx         # Catalogo box (home)
│   ├── DettaglioBox.tsx     # Dettaglio singola box
│   ├── Carrello.tsx         # Carrello acquisti
│   ├── Ordini.tsx           # Storico ordini
│   └── Profilo.tsx          # Profilo utente e indirizzi
├── components/
│   ├── Navbar.tsx           # Barra di navigazione
│   └── ui/                  # Componenti shadcn/ui (Button, Card, Dialog...)
├── types/
│   ├── BoxCatalogo.ts       # Tipo TypeScript per le box nel catalogo
│   └── Carrello.ts          # Tipo TypeScript per gli item del carrello
├── lib/                     # Utility (es. cn() per classi Tailwind)
├── assets/                  # Immagini e risorse statiche
└── favIcon/                 # Icone dell'applicazione
```

---

## 🗳️ Pagine e Routing

Il routing è gestito da **React Router DOM v7** con protezione delle rotte basata sul token JWT:

| Path | Componente | Accesso | Descrizione |
|---|---|---|---|
| `/` | `Catalogo` | Pubblico | Homepage con catalogo box |
| `/login` | `Login` | Solo non autenticati | Pagina di accesso |
| `/registrazione` | `Registrazione` | Solo non autenticati | Creazione account |
| `/box/:id` | `DettaglioBox` | Pubblico | Dettaglio di una box specifica |
| `/carrello` | `Carrello` | 🔒 Autenticato | Carrello dell'utente |
| `/ordini` | `Ordini` | 🔒 Autenticato | Storico degli ordini |
| `/profilo` | `Profilo` | 🔒 Autenticato | Gestione profilo e indirizzi |
| `*` | Redirect | - | Fallback verso `/` |

### Logica di protezione

- Gli utenti **non autenticati** che tentano di accedere a rotte protette vengono reindirizzati a `/` o `/login`
- Gli utenti **già autenticati** che visitano `/login` o `/registrazione` vengono reindirizzati al catalogo

---

## 🔐 Autenticazione

L'autenticazione è gestita tramite **JWT** (JSON Web Token):

1. Al login/registrazione, il backend restituisce un token JWT
2. Il token viene salvato nel **`localStorage`** con la chiave `jwt_token`
3. Lo stato del token è mantenuto in `App.tsx` tramite `useState` e passato alle pagine via props
4. Le chiamate API autenticate includono il token nell'header `Authorization: Bearer <token>`
5. Al logout, il token viene rimosso dal `localStorage`

```tsx
// Esempio: recupero token all'avvio
const [token, setToken] = useState<string | null>(
  localStorage.getItem('jwt_token')
);
```

---

## 🌐 Connessione al Backend

Tutte le chiamate HTTP vengono effettuate tramite **Axios** verso il backend Yumaste.
L'URL base dell'API viene letto dalla variabile d'ambiente `VITE_API_URL`.

```ts
// Esempio di chiamata autenticata
axios.get(`${import.meta.env.VITE_API_URL}/user/carrello`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

> ℹ️ Assicurarsi che il backend sia in esecuzione su `http://localhost:8084` prima di avviare lo shop.

---

## 🌍 Variabili d'Ambiente

Crea un file **`.env`** nella root del progetto:

```env
VITE_API_URL=http://localhost:8084/api
```

| Variabile | Descrizione | Default |
|---|---|---|
| `VITE_API_URL` | URL base dell'API backend | `http://localhost:8084/api` |

> Le variabili Vite **devono** avere il prefisso `VITE_` per essere accessibili nel codice client.

---

## 🚀 Avvio del Progetto

### Prerequisiti

- Node.js 18+
- npm o yarn
- Backend [yumaste-backend](https://github.com/SantoFemiano/yumaste-backend) in esecuzione

### 1. Clona il repository

```bash
git clone https://github.com/SantoFemiano/yumaste-shop.git
cd yumaste-shop
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura le variabili d'ambiente

```bash
echo "VITE_API_URL=http://localhost:8084/api" > .env
```

### 4. Avvia il server di sviluppo

```bash
npm run dev
```

L'app sarà disponibile su: `http://localhost:5173` (o la porta indicata da Vite)

---

## 📦 Build di Produzione

```bash
npm run build
```

I file ottimizzati vengono generati nella cartella `dist/`. Per previsualizzare la build:

```bash
npm run preview
```

---

## 📐 Comandi Disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il dev server con hot reload (accessibile in rete locale) |
| `npm run build` | Compila TypeScript e genera la build di produzione |
| `npm run preview` | Serve la build di produzione localmente |
| `npm run lint` | Esegue ESLint sul codice sorgente |

---

## 👤 Autore

**Santo Femiano**
- GitHub: [@SantoFemiano](https://github.com/SantoFemiano)

---

*Readme generato con ❤️ per il progetto Yumaste*
