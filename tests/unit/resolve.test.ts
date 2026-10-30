import { describe, expect, it, vi } from "vitest";
import { resolveShortLink } from "@/lib/links/resolve";

const redirect = (location: string) => new Response(null, { status: 302, headers: { location } });
const html = (body: string) => new Response(body, { status: 200, headers: { "content-type": "text/html" } });

describe("short link resolver", () => {
  it("refuses hosts outside the allowlist without fetching", async () => {
    const fetchMock = vi.fn();
    for (const url of ["https://example.com/x", "http://127.0.0.1/", "https://m.tb.cn:8443/x", "file:///etc/passwd"]) {
      expect(await resolveShortLink(url, fetchMock)).toEqual({ ok: false, reason: "not-allowed" });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("follows redirects to a marketplace item", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(redirect("https://qr.1688.com/next"))
      .mockResolvedValueOnce(redirect("https://detail.1688.com/offer/687654321012.html?tracking=1"));
    expect(await resolveShortLink("https://qr.1688.com/s/abc", fetchMock)).toEqual({
      ok: true,
      item: { marketplace: "1688", id: "687654321012" },
    });
  });

  it("stops when a redirect leaves the allowlist", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(redirect("http://169.254.169.254/latest/meta-data"));
    expect(await resolveShortLink("https://m.tb.cn/h.abc", fetchMock)).toEqual({ ok: false, reason: "failed" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reads the script redirect served by m.tb.cn", async () => {
    const page = `<script>var url = 'https:\\/\\/a.m.taobao.com\\/i612345678901.htm?price=1&amp;sourceType=item';</script>`;
    const fetchMock = vi.fn().mockResolvedValueOnce(html(page));
    expect(await resolveShortLink("https://m.tb.cn/h.abc", fetchMock)).toEqual({
      ok: true,
      item: { marketplace: "taobao", id: "612345678901" },
    });
  });

  it("fails cleanly on network errors", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("timeout"));
    expect(await resolveShortLink("https://m.tb.cn/h.abc", fetchMock)).toEqual({ ok: false, reason: "failed" });
  });
});
