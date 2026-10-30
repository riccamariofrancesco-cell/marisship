# Marisship: memoria di progetto

@AGENTS.md

Marisship è un sito gratuito, open source e non commerciale (it/en) con strumenti per chi compra da Taobao, Tmall, Weidian e 1688 tramite shopping agent. È online su https://marisship.vercel.app, il codice è in questo repo (GPL-3.0, pubblico) e `main` si pubblica da solo in produzione su Vercel.

Per rifare il sito da zero usa la skill `rebuild-marisship`. Per aggiungere dati usa `add-catalog-or-store`. Per verificare e pubblicare usa `ship-marisship`.

## Regole che non si negoziano

1. **Solo acquisti legittimi.** Niente cataloghi o spreadsheet di repliche, niente liste di venditori di repliche, niente aggregatori di "spreadsheet" per marchi di terzi. Se qualcuno lo chiede, rifiuta in modo chiaro e proponi l'alternativa legittima: negozi ufficiali, cataloghi curati di prodotti senza marchi di terzi, import CSV. È già successo una volta e l'utente ha accettato.
2. **Niente soldi in gioco.** Nessun link affiliato o referral, pubblicità, abbonamento, account, cookie o analytics. Il piano Vercel è Hobby e deve restare compatibile.
3. **Niente dati inventati.** Prezzi, tariffe, formati di URL e negozi entrano solo se verificati, con **data** e **fonte**. La tabella di confronto delle tariffe (`src/data/shipping-lines.json`) parte vuota di proposito.
4. **Niente scraping dei risultati dei marketplace e niente aggiramento dei blocchi anti-bot.** Taobao e 1688 chiedono il login per mostrare i risultati. Se un sito risponde con un blocco (CAPTCHA, pagina "punish"), ci si ferma e si spiega all'utente cosa manca: non si riprova con altri browser, ritardi o identità. I risultati "sul sito" vengono dai cataloghi curati, non da richieste in tempo reale.
5. **Niente materiale di JadeShip.** Il sito è stato ricreato solo a livello di funzioni (idee, non protette). Mai copiare testi, immagini, logo, codice, dati o layout identico. Non sono state ricreate le parti "Spreadsheet" e "Sellers" di JadeShip, perché servono a trovare repliche.
6. **Un agent entra nel convertitore solo con un formato di URL verificato** sul suo sito, con un caso di test. Gli altri restano "solo elencati".

## Comandi

```bash
npm install
npm run dev            # http://localhost:3000
npm run check          # lint + typecheck + test unitari (Vitest)
npm run build
npm run test:e2e       # Playwright; avvia da solo `next start` sulla porta 3100
E2E_BASE_URL=https://marisship.vercel.app npm run test:e2e   # stessa suite sul sito pubblicato
```

Stato di riferimento: 70 test unitari, 59 end-to-end più 1 saltato (solo mobile), 55 pagine statiche. Node 22 o superiore.

## Mappa del codice

| Percorso | Cosa contiene |
|---|---|
| `src/app/[locale]/` | Pagine. Le cartelle hanno gli slug **inglesi**; `src/proxy.ts` riscrive quelli italiani (`/it/calcolatore-spedizioni` → `/it/shipping-calculator`) e reindirizza gli slug di un'altra lingua. |
| `src/i18n/` | `config.ts` (lingue, tabella `routes`, `href()`), `dictionaries.ts` (`getLocale`, `getDictionary`), `paths.ts` (cambio lingua), `messages/{it,en}.json`. Un test impone le stesse chiavi nelle due lingue. |
| `src/lib/links/` | Parser dei link (Taobao/Tmall/Weidian/1688, testi condivisi, link annidati negli agent) e `resolve.ts` (espansione dei link brevi con allowlist anti-SSRF). |
| `src/lib/shipping/` | Peso volumetrico, scaglioni, supplementi (`calc.ts`) e schema zod delle tariffe verificate (`lines.ts`). |
| `src/lib/hold/` | La Stiva (localStorage) e l'import CSV (`csv.ts`). `MAX_ITEMS = 500` vale anche per l'export JSON. |
| `src/lib/catalogs/` | Schema zod dei cataloghi e ricerca su tutti i cataloghi (`search.ts`). |
| `src/lib/local-store.ts` | Store su localStorage con `useSyncExternalStore` e fallback in memoria. |
| `src/data/` | Dati: `agents.ts`, `stores.ts`, `categories.ts`, `search.ts`, `shipping-lines.json`, `catalogs/*.json`. |
| `src/content/` | Guide e pagine legali in MDX, una per lingua, più l'indice `guides.ts`. |
| `src/components/` | UI. Strumenti in `tools/`, layout in `layout/`, marchio in `brand/`. |
| `tests/unit`, `tests/e2e` | Vitest e Playwright. |

## Next.js 16: cose che non sono come in Next 15

Leggi sempre `node_modules/next/dist/docs/` prima di toccare le API. Quello che è costato tempo:

- Con `cacheComponents` **non esiste `dynamicParams`** (fa fallire il build). `generateStaticParams` deve restituire almeno un valore; i parametri sconosciuti si gestiscono con `notFound()` nella pagina.
- `next/root-params` (`locale()`) funziona nei Server Component ma **non nei Route Handler**, quindi neanche in `opengraph-image.tsx`: lì il locale arriva dal prop `params`. Il difetto si vedeva solo a runtime (HTTP 500), non al build.
- `middleware` si chiama `proxy.ts`. Il matcher esclude `_next`, `api` e i file con estensione.
- La barra di navigazione legge `useSelectedLayoutSegments()`: i segmenti sono gli slug interni (inglesi) anche dopo una riscrittura, quindi coincidono tra server e client.
- La regola ESLint `react-hooks/set-state-in-effect` vieta `setState` dentro `useEffect`: per localStorage usa `useLocalValue` / `useStorageAvailable` di `src/lib/local-store.ts`.
- Vitest 5 chiede `@types/node` 22 o superiore (con la 20 `npm install` fallisce per un conflitto di peer).
- Con `display: grid` serve `grid-cols-1` sui contenitori dei risultati, altrimenti su mobile i contenuti larghi (URL lunghi) allargano la pagina oltre il viewport.

## Verifica: cosa conta

- Il build e i test unitari non bastano: i bug veri (OG image, overflow su mobile) sono usciti solo dai test end-to-end e dagli screenshot. Guarda gli screenshot (desktop 1440 px e mobile 390 px, chiaro e scuro) quando cambi l'interfaccia.
- Nei test mobile confronta `scrollWidth` con la larghezza configurata del viewport (`page.viewportSize()`), non con `window.innerWidth`.
- Dopo ogni deploy lancia la suite end-to-end sull'URL di produzione.

## Come lavorare con l'utente

- L'utente scrive in italiano; risposte, README, testi del sito e note in italiano, codice e commit in inglese.
- Per decisioni grosse mostra prima un piano e aspetta l'approvazione. Per le azioni verso l'esterno (deploy, merge) agisci solo se te lo ha chiesto.
- I passaggi che spettano all'utente (link di autorizzazione Vercel, accesso dell'app GitHub di Vercel al repo) vanno chiesti subito, con il link, perché scadono.
- Dì sempre cosa non hai potuto verificare o fare, e perché.

## Come procedere

Idee in ordine di valore, tutte compatibili con le regole sopra:

1. **Più cataloghi curati** di prodotti legittimi (casa, outdoor, elettronica, articoli senza marchio), ognuno con curatore, data e fonte. Anche da contributori via pull request.
2. **Verificare i negozi ufficiali mancanti** (Logitech, DJI, OPPO, vivo, Xtep, adidas): i controlli sono stati interrotti dal blocco anti-bot di Taobao. Rifarli a mano o con l'aiuto dell'utente, senza aggirare il blocco.
3. **Tariffe di spedizione verificate** per la tabella di confronto, solo da fonti pubbliche e datate.
4. **Altri agent** (HooBuy, ACBuy, Basetao, LitBuy, Oopbuy) solo se il formato dei link si riesce a verificare senza account.
5. **Dominio personalizzato**, audit di accessibilità e Lighthouse, aggiornamento delle dipendenze, nuove guide.
