---
name: add-catalog-or-store
description: Come aggiungere a Marisship un catalogo di prodotti, un negozio ufficiale, un agent nel convertitore o tariffe di spedizione, verificando ogni dato con data e fonte. Usala quando l'utente o un contributore vuole ampliare i dati del sito.
---

# Aggiungere dati a Marisship

Regola generale: **ogni dato si verifica prima di entrare** e porta con sé una data (`lastChecked` / `lastVerified`) e, dove previsto, una fonte. Solo prodotti legittimi, mai repliche o articoli con marchi o personaggi di terzi senza licenza.

## Catalogo di prodotti

1. Crea `src/data/catalogs/<id>.json` e registralo nell'array `sources` di `src/lib/catalogs/catalogs.ts`.
2. Campi del catalogo: `id` (minuscole e trattini), `title` e `description` in `it` e `en`, `curator`, `lastVerified` (data ISO), `source` (URL, facoltativo), `items`.
3. Campi di ogni articolo: `marketplace` (`taobao`, `tmall`, `weidian`, `1688`), `id` (solo cifre, 6-20), `title` in `it` e `en`, `category` (una di `src/data/categories.ts`), `priceCny` (facoltativo, indicativo alla data `lastVerified`).
4. Titoli scritti da te, **non copiati** dall'inserzione. Niente marchi di terzi: se il titolo originale contiene un marchio o un personaggio, scarta l'articolo.
5. Lo schema zod viene verificato a build time: un catalogo malformato fa fallire `npm run build`. Un test controlla anche id unici e chiavi dei dizionari per le categorie.
6. Aggiungi o aggiorna i test in `tests/unit/catalogs.test.ts` e, se cambia il numero di articoli, il conteggio atteso in `tests/e2e/site.spec.ts` (`catalogs › searches every catalog`, oggi 12).

## Negozio ufficiale

1. Un negozio entra in `src/data/stores.ts` solo se la pagina `https://<marchio>.tmall.com/` si apre e il suo `<title>` riporta il nome ufficiale del marchio (`官方旗舰店` o `旗舰店`). Molte pagine sono generate via JavaScript: renderizzale con Playwright e leggi `page.title()`.
2. Attenzione ai nomi simili: `huawei.tmall.com` mostra "花威旗舰店", un negozio diverso, quindi è escluso. Il test `official stores` lo ricorda.
3. Compila `slug`, `brand`, `shopName` (esattamente come lo mostra Tmall), `category`, `url` (`https://<sottodominio>.tmall.com/`), `lastChecked`.
4. Aggiorna il numero atteso di negozi e il conteggio per categoria in `tests/e2e/site.spec.ts` (oggi 16 negozi, 5 in "Elettronica").
5. **Se Taobao mostra un blocco anti-bot** (pagina `punish`, "slide to verify"), fermati. Non riprovare con altri browser, pause o identità: segna i negozi non verificati e chiedi all'utente. Rimasti da verificare: Logitech, DJI, OPPO, vivo, Xtep, adidas.

## Agent nel convertitore

1. Trova il formato dei link **sul sito dell'agent**: link che pubblica nella sua home, oppure una pagina prodotto che si apre con un articolo reale. Se serve un account, l'agent resta "solo elencato" (`marketplaces: []`, nessun `buildUrl`).
2. Aggiungi la voce in `src/data/agents.ts` con `buildUrl`, `marketplaces` e `lastChecked`. **Mai** parametri affiliato o referral.
3. Aggiungi i casi in `tests/unit/links.test.ts` (andata e ritorno su tutti i marketplace e formato esatto dell'URL). Aggiorna l'elenco atteso in `only offers agents with a builder`.
4. Per riconoscere anche i link già nel formato dell'agent, controlla `src/lib/links/parse.ts` (`pathItem`, `idAndPlatformItem`, `nestedMarketplaceItem`).

## Tariffe di spedizione

1. Solo da fonti pubbliche, con la data in cui le hai lette. Mai stime a occhio.
2. Aggiungi la voce in `src/data/shipping-lines.json` (struttura nel README, sezione "Aggiungere tariffe verificate"). `lastVerified` e `source` sono obbligatori: il build fallisce senza.
3. `tests/unit/shipping.test.ts` oggi si aspetta il file vuoto (`is valid and starts empty`): aggiornalo quando aggiungi la prima voce.

## Sempre

```bash
npm run check        # lint, typecheck, test unitari
npm run build
npm run test:e2e
```

Poi segui la skill `ship-marisship`.
