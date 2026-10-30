---
name: rebuild-marisship
description: Come Marisship è stato costruito da zero e come ricreare un sito analogo (strumenti per shopping agent, bilingue, senza affiliati) rispettando copyright e legalità. Usala quando devi rifare il sito, partire da un progetto simile o capire perché è fatto così.
---

# Ricreare Marisship

Obiettivo di partenza dell'utente: "ricrea jadeship.com con un altro nome, logo e il mio tocco, senza violare il diritto d'autore". Il risultato è un sito originale che riprende **solo le funzioni**, non i contenuti.

## 1. Analizza l'originale senza copiarlo

1. Scarica la home e renderizzala con Playwright (`chromium.launch()` funziona senza opzioni): titoli, navigazione, testi, screenshot desktop e mobile. Serve a capire **cosa fa** il sito, non a riusarne il contenuto.
2. Separa le funzioni in due gruppi:
   - **Strumenti generici**: calcolatore spedizioni, convertitore di link tra agent, elenco agent, ricerca nei marketplace, guide. Si possono ricreare come idee.
   - **Catalogo di repliche**: "spreadsheet" con migliaia di articoli di marchi di terzi, feed dei più venduti, elenco di venditori "1to1". **Non si ricrea**: facilita l'acquisto di contraffazioni, copia database e dati personali (telefoni dei venditori) e viola le regole di Vercel. Dillo all'utente subito, e anche dopo se lo richiede (è successo).
3. Non copiare niente di proprio: testi, immagini, logo, codice, nomi di sezioni distintivi, struttura grafica identica.

## 2. Fai le domande che cambiano il lavoro

Con `AskUserQuestion`: nome, lingue, stile visivo, come gestire le tariffe, affiliati sì/no, contatti pubblici, fino a dove pubblicare. Scelte fatte qui: nome **Marisship** (dal nome del repo), **it + en**, stile **nautico**, tariffe **inserite dall'utente più tabelle verificate**, **nessun affiliato**, contatti via **issue di GitHub** (repo reso pubblico dall'utente), deploy su Vercel.

Poi scrivi il piano e fallo approvare prima di costruire.

## 3. Stack e scaffold

Next.js 16 (App Router) con `cacheComponents` e `partialPrefetching`, React 19, TypeScript, Tailwind 4, MDX (`@next/mdx`), zod 4, Vitest 5, `@playwright/test` **1.63.0** (allineato al Chromium preinstallato), `@types/node` 22. i18n **nativa** (`next/root-params` + dizionari JSON), non next-intl: con Cache Components è più semplice e prevedibile.

```bash
npx create-next-app@16.4.3 marisship --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install
```

Leggi `node_modules/next/dist/docs/` (internazionalizzazione, cacheComponents, proxy, mdx) prima di scrivere codice. Le trappole sono nel `CLAUDE.md`.

## 4. Ordine di costruzione

1. **Librerie pure con test** prima dell'interfaccia: parser dei link, registro agent, calcolo spedizioni, Stiva, espansione dei link brevi, i18n. 54 test unitari nella prima versione.
2. **Verifica i formati di URL degli agent sui loro siti**: leggi i link che l'agent pubblica nella sua home (Superbuy) o apri una pagina prodotto con un articolo reale (Kakobuy, CSSBuy, LoveGoBuy, Sugargoo). Salva ogni formato come caso di test di andata e ritorno. Chi richiede il login (HooBuy, ACBuy) resta "solo elencato".
3. **Identità**: token colore (abisso, oceano, mare, sabbia, schiuma, corallo, ottone) con tema chiaro/scuro, controllo dei contrasti WCAG AA via script, logo SVG originale (vela a "M", scafo, onda), font Fraunces e Manrope, illustrazione dell'oblò. Renderizza il logo in più dimensioni e nei due temi prima di usarlo.
4. **Layout**: intestazione con cambio lingua e tema, menu mobile, piè di pagina con disclaimer ("non affiliato", "nessun link affiliato", "non supporta contraffazioni").
5. **Pagine**: home, calcolatore, convertitore, Stiva, ricerca, agent, guide (3 per lingua), privacy, termini, contatti, 404, `sitemap.ts`, `robots.ts`, immagini OG.
6. **Test end-to-end** su desktop e mobile, **screenshot** di ogni pagina, correzioni.
7. **Estensioni successive** (stessa metodologia): negozi ufficiali verificati, cataloghi curati con ricerca sul sito, import CSV nella Stiva.

## 5. Contenuti

Testi dell'interfaccia e guide scritti da zero in italiano e inglese. Per le affermazioni su dazi e IVA cita solo fonti ufficiali verificate (Commissione europea, "La tua Europa") e dì che importi e regole cambiano.

## 6. Cosa evitare (già incontrato)

- `pkill -f "next start"` uccide anche la shell perché il pattern compare nel suo comando: ferma i server con il PID (`ps -eo pid,args | grep next-server`).
- `ss`, `column` e `rsync` non ci sono nel container.
- Tentativi di aggirare un blocco anti-bot: bloccati dal sistema e non consentiti dalle regole del progetto.
