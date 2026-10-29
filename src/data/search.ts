import type { Locale } from "@/i18n/config";

// Official marketplace search URLs, checked on 2026-10-29: Taobao and Tmall
// (Tmall's own search now redirects to Taobao's "mall" tab) work without an
// account; 1688 asks for a login. Weidian has no public web search.

export const searchTargets = [
  { id: "taobao", name: "Taobao", url: (q: string) => `https://s.taobao.com/search?q=${encodeURIComponent(q)}` },
  { id: "tmall", name: "Tmall", url: (q: string) => `https://s.taobao.com/search?q=${encodeURIComponent(q)}&tab=mall` },
  {
    id: "1688",
    name: "1688",
    url: (q: string) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(q)}`,
  },
] as const;

export interface GlossaryTerm {
  zh: string;
  pinyin: string;
  meaning: Record<Locale, string>;
}

export const glossary: GlossaryTerm[] = [
  { zh: "帆布包", pinyin: "fānbù bāo", meaning: { it: "borsa di tela", en: "canvas bag" } },
  { zh: "双肩包", pinyin: "shuāngjiān bāo", meaning: { it: "zaino", en: "backpack" } },
  { zh: "外套", pinyin: "wàitào", meaning: { it: "giacca, cappotto", en: "jacket, coat" } },
  { zh: "卫衣", pinyin: "wèiyī", meaning: { it: "felpa", en: "sweatshirt, hoodie" } },
  { zh: "裤子", pinyin: "kùzi", meaning: { it: "pantaloni", en: "trousers" } },
  { zh: "运动鞋", pinyin: "yùndòng xié", meaning: { it: "scarpe sportive", en: "trainers, sneakers" } },
  { zh: "手机壳", pinyin: "shǒujī ké", meaning: { it: "cover per telefono", en: "phone case" } },
  { zh: "收纳盒", pinyin: "shōunà hé", meaning: { it: "scatola portaoggetti", en: "storage box" } },
  { zh: "台灯", pinyin: "táidēng", meaning: { it: "lampada da tavolo", en: "desk lamp" } },
  { zh: "机械键盘", pinyin: "jīxiè jiànpán", meaning: { it: "tastiera meccanica", en: "mechanical keyboard" } },
  { zh: "茶具", pinyin: "chájù", meaning: { it: "servizio da tè", en: "tea set" } },
  { zh: "大容量", pinyin: "dà róngliàng", meaning: { it: "grande capienza", en: "large capacity" } },
  { zh: "纯棉", pinyin: "chún mián", meaning: { it: "puro cotone", en: "pure cotton" } },
  { zh: "加厚", pinyin: "jiā hòu", meaning: { it: "più spesso, imbottito", en: "thicker, padded" } },
  { zh: "尺码", pinyin: "chǐmǎ", meaning: { it: "taglia", en: "size" } },
  { zh: "现货", pinyin: "xiànhuò", meaning: { it: "disponibile subito", en: "in stock" } },
  { zh: "包邮", pinyin: "bāoyóu", meaning: { it: "spedizione interna gratuita", en: "free domestic shipping" } },
];
