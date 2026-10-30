import type { Category } from "./categories";

// Official brand stores on Tmall. Each entry was checked on its Tmall domain:
// the store page loads and its title is the brand's own flagship store
// (官方旗舰店 / 旗舰店). Lookalikes are left out: huawei.tmall.com, for example,
// belongs to an unrelated store and is not listed.

export interface Store {
  slug: string;
  brand: string;
  /** Store name exactly as Tmall shows it. */
  shopName: string;
  category: Category;
  url: string;
  lastChecked: string;
  /** Optional note key under `stores.notes` in the dictionaries. */
  note?: "plugs";
}

const checked = "2026-10-30";
const tmall = (subdomain: string) => `https://${subdomain}.tmall.com/`;

export const stores: Store[] = [
  { slug: "xiaomi", brand: "Xiaomi", shopName: "小米官方旗舰店", category: "electronics", url: tmall("xiaomi"), lastChecked: checked },
  { slug: "anker", brand: "Anker", shopName: "Anker安克官方旗舰店", category: "electronics", url: tmall("anker"), lastChecked: checked },
  { slug: "ugreen", brand: "UGREEN", shopName: "绿联旗舰店", category: "electronics", url: tmall("ugreen"), lastChecked: checked },
  { slug: "lenovo", brand: "Lenovo", shopName: "联想官方旗舰店", category: "electronics", url: tmall("lenovo"), lastChecked: checked },
  { slug: "baseus", brand: "Baseus", shopName: "baseus倍思旗舰店", category: "electronics", url: tmall("baseus"), lastChecked: checked },
  { slug: "lining", brand: "Li-Ning", shopName: "李宁官方旗舰店", category: "sport", url: tmall("lining"), lastChecked: checked },
  { slug: "anta", brand: "Anta", shopName: "安踏官方旗舰店", category: "sport", url: tmall("anta"), lastChecked: checked },
  { slug: "uniqlo", brand: "Uniqlo", shopName: "优衣库官方旗舰店", category: "clothing", url: tmall("uniqlo"), lastChecked: checked },
  { slug: "bosideng", brand: "Bosideng", shopName: "波司登官方旗舰店", category: "clothing", url: tmall("bosideng"), lastChecked: checked },
  { slug: "muji", brand: "MUJI", shopName: "无印良品MUJI官方旗舰店", category: "home", url: tmall("muji"), lastChecked: checked },
  { slug: "popmart", brand: "Pop Mart", shopName: "泡泡玛特旗舰店", category: "toys", url: tmall("popmart"), lastChecked: checked },
  { slug: "lego", brand: "LEGO", shopName: "乐高官方旗舰店", category: "toys", url: tmall("lego"), lastChecked: checked },
  { slug: "deli", brand: "Deli", shopName: "得力官方旗舰店", category: "stationery", url: tmall("deli"), lastChecked: checked },
  { slug: "chenguang", brand: "M&G (Chenguang)", shopName: "晨光官方旗舰店", category: "stationery", url: tmall("chenguang"), lastChecked: checked },
  { slug: "haier", brand: "Haier", shopName: "海尔官方旗舰店", category: "appliances", url: tmall("haier"), lastChecked: checked, note: "plugs" },
  { slug: "midea", brand: "Midea", shopName: "美的官方旗舰店", category: "appliances", url: tmall("midea"), lastChecked: checked, note: "plugs" },
];
