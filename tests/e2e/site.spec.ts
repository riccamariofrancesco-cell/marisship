import { expect, test, type Page } from "@playwright/test";

const TB = "612345678901";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text());
  });
  return errors;
}

// Mobile emulation widens window.innerWidth along with the content, so compare
// against the configured viewport instead.
async function noHorizontalScroll(page: Page) {
  const width = page.viewportSize()!.width;
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(width);
}

test.describe("routing", () => {
  test("redirects the root to the visitor's language", async ({ request }) => {
    const it = await request.get("/", { headers: { "accept-language": "it-IT,it;q=0.9" }, maxRedirects: 0 });
    expect(it.headers().location).toMatch(/\/it$/);
    const en = await request.get("/", { headers: { "accept-language": "en-US" }, maxRedirects: 0 });
    expect(en.headers().location).toMatch(/\/en$/);
  });

  test("serves Italian slugs and fixes wrong-language ones", async ({ page, request }) => {
    const wrong = await request.get("/it/shipping-calculator", { maxRedirects: 0 });
    expect(wrong.status()).toBe(308);
    expect(wrong.headers().location).toMatch(/\/it\/calcolatore-spedizioni$/);
    await page.goto("/it/calcolatore-spedizioni");
    await expect(page.getByRole("heading", { level: 1, name: "Calcolatore spedizioni" })).toBeVisible();
  });

  test("returns a localized 404", async ({ page }) => {
    const response = await page.goto("/it/non-esiste");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Disperso in mare" })).toBeVisible();
  });

  test("publishes sitemap, robots and icons", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/it/calcolatore-spedizioni");
    expect((await request.get("/robots.txt")).ok()).toBe(true);
    expect((await request.get("/icon.svg")).ok()).toBe(true);
    for (const locale of ["it", "en"]) {
      const og = await request.get(`/${locale}/opengraph-image`);
      expect(og.status()).toBe(200);
      expect(og.headers()["content-type"]).toContain("image/png");
    }
  });
});

test.describe("pages", () => {
  for (const path of [
    "/it",
    "/en",
    "/it/convertitore-link",
    "/en/hold",
    "/it/agent",
    "/en/search",
    "/it/guide",
    "/en/privacy",
    "/it/cataloghi",
    "/en/official-stores",
  ]) {
    test(`renders ${path} without errors or sideways scroll`, async ({ page }) => {
      const errors = trackErrors(page);
      const response = await page.goto(path);
      expect(response?.ok()).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await noHorizontalScroll(page);
      expect(errors).toEqual([]);
    });
  }

  test("contains no affiliate parameters", async ({ page }) => {
    await page.goto("/en/agents");
    const hrefs = await page.locator("a[href^='http']").evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) expect(href).not.toMatch(/(aff|ref|invite|partner)=/i);
  });
});

test.describe("language and theme", () => {
  test("switches to the same page in the other language", async ({ page }) => {
    await page.goto("/it/calcolatore-spedizioni");
    await page.getByRole("link", { name: "Read this page in English" }).click();
    await expect(page).toHaveURL(/\/en\/shipping-calculator$/);
    await expect(page.getByRole("heading", { level: 1, name: "Shipping calculator" })).toBeVisible();
  });

  test("keeps a guide when switching language", async ({ page }) => {
    await page.goto("/it/guide/peso-reale-e-peso-volumetrico");
    await page.getByRole("link", { name: "Read this page in English" }).click();
    await expect(page).toHaveURL(/\/en\/guides\/actual-vs-volumetric-weight$/);
  });

  test("remembers the dark theme", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  });
});

test.describe("tools", () => {
  test("calculator prices a parcel", async ({ page }) => {
    await page.goto("/en/shipping-calculator");
    await page.getByLabel("Actual weight").fill("1200");
    await page.getByLabel("First weight price").fill("120");
    await page.getByLabel("Price per step").fill("40");
    await expect(page.getByTestId("calc-total")).toContainText("200.00");
    await page.getByLabel("Length").fill("40");
    await page.getByLabel("Width").fill("30");
    await page.getByLabel("Height").fill("20");
    // 40×30×20 / 6000 = 4 kg → 500 g + 7 steps = 120 + 280
    await expect(page.getByTestId("calc-total")).toContainText("400.00");
    await expect(page.getByText("Volume beats weight here")).toBeVisible();
  });

  test("converter builds agent links and stows the item", async ({ page }) => {
    await page.goto("/en/link-converter");
    await page.getByLabel("Links to convert").fill(`【淘宝】 https://item.taobao.com/item.htm?id=${TB}&spm=tracking`);
    await page.getByRole("button", { name: "Convert" }).click();
    const result = page.getByTestId("converter-result");
    await expect(result).toContainText(`#${TB}`);
    await expect(result.getByRole("link", { name: /Superbuy/ })).toHaveAttribute(
      "href",
      `https://www.superbuy.com/en/page/buy/?url=${encodeURIComponent(`https://item.taobao.com/item.htm?id=${TB}`)}`,
    );
    await noHorizontalScroll(page);
    await result.getByRole("button", { name: "Stow in the Hold" }).click();
    await expect(result.getByRole("button", { name: "In the Hold" })).toBeDisabled();
    await page.goto("/en/hold");
    await expect(page.getByTestId("hold-item")).toHaveCount(1);
  });

  test("converter reports unknown links", async ({ page }) => {
    await page.goto("/it/convertitore-link");
    await page.getByLabel("Link da convertire").fill("https://example.com/qualcosa");
    await page.getByRole("button", { name: "Converti" }).click();
    await expect(page.getByTestId("converter-result")).toContainText("Non riconosciuto");
  });

  test("the Hold adds up items, persists and feeds the calculator", async ({ page }) => {
    await page.goto("/en/hold");
    await page.getByLabel("Item link").fill(`https://detail.1688.com/offer/${TB}.html?spm=x`);
    await page.getByLabel("Name or note").fill("Tea set");
    await page.getByLabel("Unit price (CNY)").fill("35.5");
    await page.getByLabel("Quantity").fill("2");
    await page.getByLabel("Weight per unit (g)").fill("300");
    await page.getByRole("button", { name: "Stow it" }).click();
    await expect(page.getByTestId("hold-weight")).toHaveText("600 g");
    await page.reload();
    await expect(page.getByTestId("hold-count")).toHaveText("2");
    await noHorizontalScroll(page);
    await page.getByRole("link", { name: "Estimate shipping for this weight" }).click();
    await expect(page).toHaveURL(/shipping-calculator\?w=600$/);
    await expect(page.getByLabel("Actual weight")).toHaveValue("600");
  });

  test("search links to the official marketplace search", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("button", { name: "帆布包" }).click();
    await expect(page.getByRole("link", { name: /Taobao/ })).toHaveAttribute(
      "href",
      `https://s.taobao.com/search?q=${encodeURIComponent("帆布包")}`,
    );
  });

  test("short-link API refuses other hosts", async ({ request }) => {
    const response = await request.post("/api/resolve", { data: { url: "https://example.com/x" } });
    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({ ok: false, reason: "not-allowed" });
  });
});

test.describe("mobile navigation", () => {
  test("opens the menu and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/it");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("banner").getByRole("link", { name: "La Stiva" }).click();
    await expect(page).toHaveURL(/\/it\/stiva$/);
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("official stores", () => {
  test("lists verified stores and filters them", async ({ page }) => {
    await page.goto("/it/negozi-ufficiali");
    await expect(page.getByRole("heading", { level: 1, name: "Negozi ufficiali" })).toBeVisible();
    await expect(page.getByTestId("store-card")).toHaveCount(16);
    await page.getByLabel("Cerca un marchio").fill("lego");
    await expect(page.getByTestId("store-card")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Apri il negozio su Tmall/ })).toHaveAttribute("href", "https://lego.tmall.com/");
    await page.getByLabel("Cerca un marchio").fill("");
    await page.getByRole("button", { name: "Elettronica" }).click();
    await expect(page.getByTestId("store-card")).toHaveCount(5);
    await expect(page.getByTestId("stores-count")).toHaveText("Negozi: 5");
  });
});

test.describe("catalogs", () => {
  test("searches every catalog and shows results on the site", async ({ page }) => {
    await page.goto("/en/catalogs");
    const hits = page.getByTestId("catalog-hit");
    await expect(hits).toHaveCount(12);
    await page.getByLabel("What are you looking for?").fill("ceramic cup");
    await expect(hits).toHaveCount(1);
    await expect(hits.first()).toContainText("Starry Night");
    await expect(hits.first().getByRole("link", { name: /Open on Tmall/ })).toHaveAttribute(
      "href",
      "https://detail.tmall.com/item.htm?id=898600257194",
    );
    await page.getByLabel("What are you looking for?").fill("");
    await page.getByLabel("Category").selectOption("toys");
    const toys = await hits.count();
    expect(toys).toBeGreaterThan(0);
    for (let i = 0; i < toys; i++) await expect(hits.nth(i)).toContainText("Toys and hobbies");
    await page.getByLabel("What are you looking for?").fill("zzzz-nothing");
    await expect(page.getByText("Nothing found.")).toBeVisible();
  });

  test("stows a catalog item in the Hold", async ({ page }) => {
    await page.goto("/it/cataloghi");
    await page.getByLabel("Cosa stai cercando?").fill("tazza");
    await page.getByTestId("catalog-hit").first().getByRole("button", { name: "Metti nella Stiva" }).click();
    await page.goto("/it/stiva");
    await expect(page.getByTestId("hold-item")).toHaveCount(1);
    await expect(page.getByTestId("hold-item")).toContainText("Notte stellata");
  });
});

test.describe("CSV import", () => {
  const csv = [
    "Nome;Link articolo;Prezzo (CNY);Quantità;Peso (g)",
    `Tazza;https://item.taobao.com/item.htm?id=${TB};35,5;2;300`,
    "Quaderno;https://weidian.com/item.html?itemID=7412345678;12;1;0,2 kg",
    "Senza link;;5;1;100",
  ].join("\n");

  test("imports a CSV file after a preview", async ({ page }) => {
    await page.goto("/it/stiva");
    await page.getByTestId("hold-file").setInputFiles({ name: "lista.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await expect(page.getByTestId("csv-preview")).toContainText("Articoli trovati: 3 · con link riconosciuto: 2.");
    await page.getByRole("button", { name: "Aggiungi alla Stiva" }).click();
    await expect(page.getByTestId("hold-item")).toHaveCount(3);
    await expect(page.getByTestId("hold-count")).toHaveText("4");
    await expect(page.getByTestId("hold-weight")).toHaveText("900 g");
  });

  test("imports pasted CSV text and reports unusable input", async ({ page }) => {
    await page.goto("/en/hold");
    await page.locator("summary", { hasText: "Paste CSV text" }).click();
    await page.getByLabel("Paste CSV text").fill("price,qty\n1,2");
    await page.getByRole("button", { name: "Read" }).click();
    await expect(page.getByText("No usable rows")).toBeVisible();
    await page.getByLabel("Paste CSV text").fill(`link,name\nhttps://detail.1688.com/offer/687654321012.html,Lamp`);
    await page.getByRole("button", { name: "Read" }).click();
    await page.getByRole("button", { name: "Add to the Hold" }).click();
    await expect(page.getByTestId("hold-item")).toHaveCount(1);
    await expect(page.getByText("Items added to the Hold: 1.")).toBeVisible();
  });
});
