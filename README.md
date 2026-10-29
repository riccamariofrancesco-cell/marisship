# Marisship

Strumenti gratuiti e open source per chi compra dalla Cina (Taobao, Tmall, Weidian, 1688) tramite gli shopping agent. In italiano e in inglese.

- **Calcolatore spedizioni**: peso reale e volumetrico, scaglioni, supplemento carburante, sconti e commissioni, con cambio BCE.
- **Convertitore link**: da link di marketplace o di agent a link puliti per ogni agent supportato; espande i link brevi ufficiali.
- **La Stiva**: pianificatore di carico nel browser, con totali di prezzo e peso da passare al calcolatore.
- **Ricerca marketplace**: apre la ricerca ufficiale di Taobao, Tmall e 1688, con un prontuario di parole chiave in cinese.
- **Agent** e **guide**: elenco neutrale e guide in parole semplici.

## Principi

- **Niente link affiliati, pubblicità, account, cookie o tracciamento.**
- **Niente prezzi inventati**: le tariffe le inserisce l'utente, oppure vengono da tabelle verificate con data e fonte.
- **Solo acquisti legittimi**: Marisship non include cataloghi di repliche né liste di venditori.
- Progetto indipendente, non affiliato ai marketplace né agli agent.

## Sviluppo

Serve Node.js 22 o superiore.

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + test unitari
npm run build
npm run test:e2e     # Playwright (avvia da solo il server di produzione)
```

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, MDX, Vitest, Playwright.

### Struttura

| Percorso | Contenuto |
|---|---|
| `src/app/[locale]/` | Pagine. Le cartelle usano gli slug inglesi; `src/proxy.ts` riscrive quelli italiani (`/it/calcolatore-spedizioni` → `/it/shipping-calculator`). |
| `src/i18n/` | Lingue, percorsi localizzati e testi (`messages/it.json`, `messages/en.json`). |
| `src/lib/` | Logica pura e testata: link (`links/`), spedizioni (`shipping/`), Stiva (`hold/`), cambio (`fx.ts`). |
| `src/data/` | Agent, tariffe verificate, URL di ricerca e prontuario. |
| `src/content/` | Guide e pagine legali in MDX, una per lingua. |
| `tests/` | Test unitari (`unit/`) ed end-to-end (`e2e/`). |

### Aggiungere un agent al convertitore

1. Verifica il formato dei link **sul sito dell'agent** (link che l'agent stesso pubblica, o una pagina prodotto che si apre con un articolo reale).
2. Aggiungi `buildUrl` e `marketplaces` all'agent in `src/data/agents.ts`, con la data in `lastChecked`.
3. Aggiungi un caso in `tests/unit/links.test.ts`: il test di andata e ritorno controlla che il link generato venga riconosciuto.

Mai parametri affiliato o referral: un test lo impedisce.

### Aggiungere tariffe verificate

Le tariffe per il confronto stanno in `src/data/shipping-lines.json` e vengono validate durante il build. Ogni voce richiede `lastVerified` (data) e `source` (URL pubblico):

```json
{
  "agent": "superbuy",
  "name": "Nome della linea",
  "countries": ["IT"],
  "divisor": 6000,
  "pricing": { "type": "step", "firstWeightG": 500, "firstPrice": 120, "stepWeightG": 500, "stepPrice": 40 },
  "currency": "CNY",
  "days": [10, 20],
  "lastVerified": "2026-10-29",
  "source": "https://…"
}
```

## Contatti

Segnalazioni e idee: [issue di GitHub](https://github.com/riccamariofrancesco-cell/marisship/issues). Le issue sono pubbliche: non inserire dati personali.

## Licenza

[GPL-3.0](LICENSE).
