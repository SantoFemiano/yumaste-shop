export interface BoxCatalogo {
    id: number;
    nome: string;
    descrizione: string;
    prezzo: number;
    prezzoScontato: number | null;
    scontoApplicato: string | null;
    immagineUrl: string | null;
    categorie: string[];
}
