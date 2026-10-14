"use client";
import React, { useState, useRef, useEffect } from 'react';

let openPhotoPreview = (_src: string, _title: string) => {};

const ORDER_DRAFT_KEY = 'nurseforge-order-draft';
const SHIP_METHODS = ['post', 'sf_station', 'sf_locker', 'sf_store', 'sf_direct'];

const TAPE_COLORS = [
  { key: 'tapeWhite', label: '白色', swatch: '#ffffff' },
  { key: 'tapeGrey', label: '灰色', swatch: '#9ca3af' },
  { key: 'tapeBlack', label: '黑色', swatch: '#111111' },
  { key: 'tapeRed', label: '深紅', swatch: '#dc2626' },
  { key: 'tapeYellow', label: '暖黃', swatch: '#f59e0b' },
  { key: 'tapeOrange', label: '橙色', swatch: '#f97316' },
  { key: 'tapePurple', label: '紫色', swatch: '#a855f7' },
  { key: 'tapeGreen', label: '綠色', swatch: '#22c55e' },
  { key: 'tapePink', label: '櫻花粉', swatch: '#f472b6' },
  { key: 'tapeDesertYellow', label: '沙漠黃', swatch: '#eab308' },
  { key: 'tapeOceanBlue', label: '海洋藍', swatch: '#38bdf8' },
  { key: 'tapeIceBlue', label: '冰藍', swatch: '#7dd3fc' },
  { key: 'tapeAppleGreen', label: '青苹果绿', swatch: '#84cc16' },
  { key: 'tapeMarble', label: '大理石', swatch: '#d6d3d1' },
];

function coverSum(map: Record<string, number> | null | undefined) {
  if (!map) return 0;
  return Object.values(map).reduce((sum, qty) => sum + qty, 0);
}

function sameCoverMap(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] || 0) !== (b[key] || 0)) return false;
  }
  return true;
}

function defaultCoverColors(sourceItems: any, addonQty: number) {
  const next: Record<string, number> = {};
  if (addonQty <= 0) return next;
  let left = addonQty;
  const tapes = TAPE_COLORS.filter((color) => Math.floor(Number(sourceItems?.[color.key]) || 0) > 0);
  for (const tape of tapes) {
    if (left <= 0) break;
    const take = Math.min(Math.floor(Number(sourceItems[tape.key]) || 0), left);
    if (take > 0) next[tape.key] = take;
    left -= take;
  }
  if (left > 0 && tapes.length) next[tapes[0].key] = (next[tapes[0].key] || 0) + left;
  return next;
}

function normalizeCoverColors(raw: any, addonQty: number) {
  const next: Record<string, number> = {};
  if (!raw || typeof raw !== 'object' || addonQty <= 0) return next;
  let left = addonQty;
  for (const color of TAPE_COLORS) {
    const n = Math.floor(Number(raw[color.key]));
    if (!Number.isFinite(n) || n <= 0) continue;
    const take = Math.min(n, left);
    if (take > 0) next[color.key] = take;
    left -= take;
    if (left <= 0) return next;
  }
  return next;
}

function readCoverColors(saved: any, sourceItems: any) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return null;
  const flat = Object.values(saved).every((value) => value == null || typeof value !== 'object');
  if (!flat) return null;
  const addonQty = Math.max(0, Math.floor(Number(sourceItems?.coverAddon) || 0));
  if (addonQty <= 0) return null;
  const next = normalizeCoverColors(saved, addonQty);
  return sameCoverMap(next, defaultCoverColors(sourceItems, addonQty)) ? null : next;
}

function coverColorText(map: Record<string, number>, addonQty: number, withMissing: boolean) {
  const parts: string[] = [];
  let assigned = 0;
  for (const color of TAPE_COLORS) {
    const qty = map[color.key] || 0;
    if (qty > 0) {
      parts.push(`${color.label} x${qty}`);
      assigned += qty;
    }
  }
  const missing = addonQty - assigned;
  if (withMissing && missing > 0) parts.push(`顏色未揀 x${missing}`);
  return parts.join('、');
}

function addonCoverDetail(sourceItems: any, coverColors: Record<string, number> | null) {
  const addonQty = Math.max(0, Math.floor(Number(sourceItems?.coverAddon) || 0));
  if (addonQty <= 0) return '';
  const defaults = defaultCoverColors(sourceItems, addonQty);
  const colors = coverColors == null ? defaults : normalizeCoverColors(coverColors, addonQty);
  const assigned = coverSum(colors);
  const text = coverColorText(colors, addonQty, true);
  if (!text) return '顏色未揀';
  if ((coverColors == null || sameCoverMap(colors, defaults)) && assigned === addonQty) {
    return `跟座身：${coverColorText(colors, addonQty, false)}`;
  }
  return text;
}

function newOrderId() {
  return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
}

function hkToday() {
  return new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'
  }).split(',')[0].split('/').reverse().join('-');
}

function readOrderDraft() {
  try {
    const raw = localStorage.getItem(ORDER_DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

function copyPlainText(text: string) {
  const area = document.createElement('textarea');
  area.value = text;
  area.readOnly = false;
  area.style.position = 'fixed';
  area.style.left = '0';
  area.style.top = '0';
  area.style.width = '2em';
  area.style.height = '2em';
  area.style.padding = '0';
  area.style.border = 'none';
  area.style.outline = 'none';
  area.style.boxShadow = 'none';
  area.style.background = 'transparent';
  area.style.fontSize = '16px';
  document.body.appendChild(area);
  const selection = document.getSelection();
  const range = document.createRange();
  range.selectNodeContents(area);
  selection?.removeAllRanges();
  selection?.addRange(range);
  area.focus();
  area.select();
  area.setSelectionRange(0, area.value.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  selection?.removeAllRanges();
  document.body.removeChild(area);
  return ok;
}

const PRODUCT_CODES = [
  { group: '膠紙座', name: '白色膠紙座', code: '白色', price: 58 },
  { group: '膠紙座', name: '灰色膠紙座', code: '灰色', price: 58 },
  { group: '膠紙座', name: '大理石膠紙座', code: '大理石', price: 78 },
  { group: '膠紙座', name: '黑色膠紙座', code: '黑色', price: 78 },
  { group: '膠紙座', name: '深紅膠紙座', code: '深紅', price: 78 },
  { group: '膠紙座', name: '暖黃膠紙座', code: '暖黃', price: 78 },
  { group: '膠紙座', name: '橙色膠紙座', code: '橙色', price: 78 },
  { group: '膠紙座', name: '紫色膠紙座', code: '紫色', price: 78 },
  { group: '膠紙座', name: '綠色膠紙座', code: '綠色', price: 78 },
  { group: '膠紙座', name: '櫻花粉膠紙座', code: '櫻花粉', price: 78 },
  { group: '膠紙座', name: '沙漠黃膠紙座', code: '沙漠黃', price: 78 },
  { group: '膠紙座', name: '海洋藍膠紙座', code: '海洋藍', price: 78 },
  { group: '膠紙座', name: '冰藍膠紙座', code: '冰藍', price: 78 },
  { group: '膠紙座', name: '青苹果绿膠紙座', code: '青苹果绿', price: 78 },
  { group: '防塵蓋', name: '隨座加購防塵蓋', code: 'C', price: 10 },
  { group: '防塵蓋', name: '補買防塵蓋', code: 'C補', price: 15 },
  { group: '防塵蓋', name: 'Chiikawa防塵蓋', code: 'Chi', price: 30 },
  { group: '防塵蓋', name: 'Usagi防塵蓋', code: 'US', price: 30 },
  { group: '防塵蓋', name: 'Hachiware防塵蓋', code: 'HA', price: 30 },
  { group: '防塵蓋', name: 'Miffy防塵蓋 (有耳朵版本)', code: 'Me', price: 30 },
  { group: '防塵蓋', name: '近鏡Miffy防塵蓋', code: 'Mc', price: 30 },
  { group: 'Clicker', name: '叫人鐘 (正常版本)', code: 'CB正常', price: 78 },
  { group: 'Clicker', name: '叫人鐘 (舉中指版本)', code: 'CB中指', price: 78 },
  { group: 'Clicker', name: '叫人鐘收聲先 (正常版本)', code: 'CBCM正常', price: 145 },
  { group: 'Clicker', name: '叫人鐘收聲先 (舉中指版本)', code: 'CBCM中指', price: 145 },
  { group: 'Clicker', name: '粉紅白吉床', code: 'PW', price: 68 },
  { group: 'Clicker', name: '藍白吉床', code: 'BW', price: 68 },
  { group: 'Clicker', name: '吉床套裝', code: 'BED', price: 125 },
  { group: 'Clicker', name: '收聲先', code: 'CM', price: 78 },
  { group: '鎖匙扣', name: '「emo人員」鎖匙扣 (RN)', code: 'EMORN', price: 38 },
  { group: '鎖匙扣', name: '「emo人員」鎖匙扣 (APN)', code: 'EMOAPN', price: 38 },
  { group: '鎖匙扣', name: '不想上班鎖匙扣', code: 'SL', price: 28 },
  { group: '鎖匙扣', name: '如意吉場鎖匙扣', code: 'KC', price: 28 },
];

function productCodeText() {
  return ['貨品\t代碼\t價錢', ...PRODUCT_CODES.map((item) => `${item.name}\t${item.code}\t$${item.price}`)].join('\n');
}

export default function App() {
  const [agreed, setAgreed] = useState(false);
  const [orderId, setOrderId] = useState(''); 
  const [today, setToday] = useState('');
  const [randomQuote, setRandomQuote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [showColorPreview, setShowColorPreview] = useState(false);
  const [showIvCalc, setShowIvCalc] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [codeUnlocked, setCodeUnlocked] = useState(false);
  const [codePassword, setCodePassword] = useState('');
  const [codePasswordWrong, setCodePasswordWrong] = useState(false);
  const [codeCopyState, setCodeCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [photoPreview, setPhotoPreview] = useState<{ src: string; title: string } | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [copyFallback, setCopyFallback] = useState('');
  const [allowFireworks, setAllowFireworks] = useState(false);
  openPhotoPreview = (src, title) => setPhotoPreview({ src, title });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const copyFallbackRef = useRef<HTMLTextAreaElement | null>(null);

  const quotes = [
    "祝你準時收工！🕒", "見字飲水呀同事！💧", "記得去廁所，人工包埋㗎！🚽", 
    "祝你生意淡薄，越淡越好！🛌", "祝你日日返工靚腳靚場！✨", 
    "收工未呢？收工去食返餐好嘅！🍱", "祝你如意吉場，場場清空！🍊", 
    "祝你所有病人都 nil active c/o！😴", "返 night 同病人齊齊 sleep well！💤",
    "今日辛苦晒，NurseForge 撐住你！💪"
  ];

  const initialItems = {
    keyringEmoRn: 0, keyringEmoApn: 0,
    tapeWhite: 0, tapeGrey: 0, tapeAppleGreen: 0, tapeMarble: 0,
    tapeBlack: 0, tapeRed: 0, tapeYellow: 0, tapeOrange: 0, tapePurple: 0, tapeGreen: 0,
    tapePink: 0, tapeDesertYellow: 0, tapeOceanBlue: 0, tapeIceBlue: 0, 
    coverChiikawa: 0, coverUsagi: 0, coverHachiware: 0, coverMiffyEar: 0, coverMiffy: 0, coverAddon: 0, coverSingle: 0, 
    keyringNoWork: 0, keyringLucky: 0,
    clickerLuckyPink: 0, clickerLuckyBlue: 0, clickerShutUp: 0, clickerCombo: 0, 
    clickerCallbellNormal: 0, clickerCallbellFinger: 0, 
    clickerCallcarNormal: 0, clickerCallcarFinger: 0, 
    addonDiff: 0 
  };

  const [items, setItems] = useState(initialItems);
  const [emoGiftRn, setEmoGiftRn] = useState<number | null>(null);
  const [coverColors, setCoverColors] = useState<Record<string, number> | null>(null);
  const [coverEditorOpen, setCoverEditorOpen] = useState(false);
  const [shipping, setShipping] = useState({ 
    name: '', phone: '', igName: '', address: '', method: 'sf_station', remarks: ''
  });

  // 💧 IV Drip Rate 計算器 State
  const [ivVolume, setIvVolume] = useState<number | string>(100);
  const [ivDropFactor, setIvDropFactor] = useState<number | string>(15);
  const [ivTime, setIvTime] = useState<number | string>(30);
  const [ivTimeUnit, setIvTimeUnit] = useState<'mins' | 'hrs'>('mins');

  useEffect(() => {
    try {
      const saved = readOrderDraft();
      if (saved) {
        if (saved.items && typeof saved.items === 'object') {
          setItems(prev => {
            const next = { ...prev };
            for (const key of Object.keys(prev)) {
              const qty = Number(saved.items[key]);
              if (Number.isFinite(qty) && qty >= 0) (next as any)[key] = Math.floor(qty);
            }
            const legacyEmo = Number(saved.items.keyringEmo);
            if (Number.isFinite(legacyEmo) && legacyEmo > 0 && next.keyringEmoRn === 0 && next.keyringEmoApn === 0) {
              next.keyringEmoRn = Math.floor(legacyEmo);
            }
            return next;
          });
        }
        if (saved.shipping && typeof saved.shipping === 'object') {
          setShipping(prev => ({
            ...prev,
            name: typeof saved.shipping.name === 'string' ? saved.shipping.name : prev.name,
            phone: typeof saved.shipping.phone === 'string' ? saved.shipping.phone : prev.phone,
            igName: typeof saved.shipping.igName === 'string' ? saved.shipping.igName : prev.igName,
            address: typeof saved.shipping.address === 'string' ? saved.shipping.address : prev.address,
            remarks: typeof saved.shipping.remarks === 'string' ? saved.shipping.remarks : prev.remarks,
            method: SHIP_METHODS.includes(saved.shipping.method) ? saved.shipping.method : prev.method,
          }));
        }
        setCoverColors(readCoverColors(saved.coverColors, saved.items));
        if (typeof saved.promoCode === 'string') setPromoCode(saved.promoCode.slice(0, 40));
        if (typeof saved.agreed === 'boolean') setAgreed(saved.agreed);
        if (typeof saved.emoGiftRn === 'number' && Number.isFinite(saved.emoGiftRn)) setEmoGiftRn(Math.max(0, Math.floor(saved.emoGiftRn)));
        setOrderId(typeof saved.orderId === 'string' && saved.orderId ? saved.orderId : newOrderId());
        setToday(typeof saved.today === 'string' && saved.today ? saved.today : hkToday());
      } else {
        setOrderId(newOrderId());
        setToday(hkToday());
      }
    } finally {
      setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    try {
      localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify({ items, shipping, promoCode, agreed, orderId, today, coverColors, emoGiftRn }));
    } catch {
      // 手機儲存已滿或被封鎖時，呢一頁仍然可以落單。
    }
  }, [draftReady, items, shipping, promoCode, agreed, orderId, today, coverColors, emoGiftRn]);

  useEffect(() => {
    if (!draftReady) return;
    if (items.coverAddon <= 0) setCoverEditorOpen(false);
    setCoverColors((prev) => {
      if (items.coverAddon <= 0) return prev == null ? prev : null;
      if (prev == null) return prev;
      const next = normalizeCoverColors(prev, items.coverAddon);
      if (sameCoverMap(next, defaultCoverColors(items, items.coverAddon))) return null;
      return sameCoverMap(next, prev) ? prev : next;
    });
  }, [items, draftReady]);

  useEffect(() => {
    const el = copyFallbackRef.current;
    if (!copyFallback || !el) return;
    el.focus();
    el.select();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [copyFallback]);

  const hasClicker = items.clickerLuckyPink > 0 || items.clickerLuckyBlue > 0 || items.clickerShutUp > 0 || items.clickerCombo > 0 || items.clickerCallbellNormal > 0 || items.clickerCallbellFinger > 0 || items.clickerCallcarNormal > 0 || items.clickerCallcarFinger > 0;

  useEffect(() => {
    if (hasClicker && shipping.method === 'post') {
      setShipping(s => ({ ...s, method: 'sf_station' }));
    }
  }, [hasClicker]);

  // 優惠碼驗證邏輯
  const isPromoApplied = promoCode.trim().toUpperCase() === "MEMENFHK";

  // 🎇 煙花效果 (觸發 1 秒)
  useEffect(() => {
    if (allowFireworks && isPromoApplied) {
      setShowFireworks(true);
      const timer = setTimeout(() => {
        setShowFireworks(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowFireworks(false);
    }
  }, [isPromoApplied, allowFireworks]);

  // 🎆 Canvas 煙花繪製邏輯
  useEffect(() => {
    if (!showFireworks || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; alpha: number; size: number;
    }> = [];

    const colors = ['#FF0055', '#FFDD00', '#00FFCC', '#FF00FF', '#00FF66', '#FFAA00'];

    for (let fireworkCount = 0; fireworkCount < 5; fireworkCount++) {
      const cx = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const cy = Math.random() * canvas.height * 0.5 + canvas.height * 0.1;
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: Math.random() * 4 + 2
        });
      }
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha -= 0.02;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.alpha <= 0) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showFireworks]);

  // ======= ⚙️ 智能防塵蓋提示邏輯 =======
  const tapeColorQuantities = [
    items.tapeWhite, items.tapeGrey, items.tapeAppleGreen, items.tapeMarble, items.tapeBlack, items.tapeRed, 
    items.tapeYellow, items.tapeOrange, items.tapePurple, items.tapeGreen, 
    items.tapePink, items.tapeDesertYellow, items.tapeOceanBlue, items.tapeIceBlue
  ];
  
  const totalTapeCount = tapeColorQuantities.reduce((acc, curr) => acc + curr, 0);
  const distinctColorsCount = tapeColorQuantities.filter(qty => qty > 0).length;
  const looseCoverCount = items.coverChiikawa + items.coverUsagi + items.coverHachiware + items.coverMiffyEar + items.coverMiffy + items.coverSingle;
  const showCoverRemarkNotice = distinctColorsCount >= 2 && looseCoverCount > 0 && looseCoverCount !== totalTapeCount;

  const hasRealProducts = Object.entries(items).some(([key, qty]) => key !== 'addonDiff' && qty > 0);

  const rawTotal = [
    { qty: items.keyringEmoRn + items.keyringEmoApn, p: 38 },
    { qty: items.tapeWhite, p: 58 }, { qty: items.tapeGrey, p: 58 },
    { qty: items.tapeAppleGreen + items.tapeMarble + items.tapeBlack + items.tapeRed + items.tapeYellow + items.tapeOrange + items.tapePurple + items.tapeGreen + items.tapePink + items.tapeDesertYellow + items.tapeOceanBlue + items.tapeIceBlue, p: 78 },
    { qty: items.coverChiikawa + items.coverUsagi + items.coverHachiware + items.coverMiffyEar + items.coverMiffy, p: 30 }, 
    { qty: items.coverAddon, p: 10 }, { qty: items.coverSingle, p: 15 },
    { qty: items.clickerCallbellNormal + items.clickerCallbellFinger, p: 78 }, 
    { qty: items.clickerCallcarNormal + items.clickerCallcarFinger, p: 145 },
    { qty: items.clickerLuckyPink, p: 68 }, { qty: items.clickerLuckyBlue, p: 68 },
    { qty: items.clickerCombo, p: 125 }, { qty: items.clickerShutUp, p: 78 },
    { qty: items.keyringNoWork, p: 28 }, { qty: items.keyringLucky, p: 28 },
    { qty: 1, p: items.addonDiff }
  ].reduce((acc, curr) => acc + (curr.qty * curr.p), 0);

  const total = isPromoApplied ? Math.round(rawTotal * 0.9) : rawTotal;
  const isFreeSF = total >= 200;

  const customColors = [
    { k: 'Marble', n: '🏛️ 大理石' },
    { k: 'Black', n: '🖤 黑色' }, { k: 'Red', n: '❤️ 深紅' }, 
    { k: 'Yellow', n: '💛 暖黃' }, { k: 'Orange', n: '🧡 橙色' }, 
    { k: 'Purple', n: '💜 紫色' }, { k: 'Green', n: '💚 綠色' }, 
    { k: 'Pink', n: '🌸 櫻花粉' }, { k: 'DesertYellow', n: '🏜️ 沙漠黃 (Usagi黃)' },
    { k: 'OceanBlue', n: '🌊 海洋藍' },
    { k: 'IceBlue', n: '❄️ 冰藍' },
    { k: 'AppleGreen', n: '🍏 青蘋果綠' }
  ];

  const emoPaid = items.keyringEmoRn + items.keyringEmoApn;
  const emoFree = Math.floor(emoPaid / 5);
  const emoGiftRnCount = emoFree <= 0
    ? 0
    : Math.min(
        emoFree,
        Math.max(0, emoGiftRn == null
          ? (items.keyringEmoApn === 0 || items.keyringEmoRn >= items.keyringEmoApn ? emoFree : 0)
          : emoGiftRn)
      );
  const emoGiftApnCount = emoFree - emoGiftRnCount;
  const emoProduct = (label: string, paid: number, gift: number) => {
    const ship = paid + gift;
    if (ship <= 0) return null;
    return {
      name: `「emo人員」鎖匙扣 (${label})`,
      qty: ship,
      shipQty: ship,
      lineTotal: paid * 38,
      price: 38,
      detail: gift > 0 ? `其中 ${gift} 個係買五送一` : ''
    };
  };
  const activeProducts: any[] = [
    emoProduct('RN', items.keyringEmoRn, emoGiftRnCount),
    emoProduct('APN', items.keyringEmoApn, emoGiftApnCount),
    { name: '白色膠紙座', qty: items.tapeWhite, price: 58 },
    { name: '灰色膠紙座', qty: items.tapeGrey, price: 58 },
    ...customColors.map(c => ({ name: c.n + '膠紙座', qty: (items as any)[`tape${c.k}`], price: 78 })),
    { name: '隨座加購防塵蓋', qty: items.coverAddon, price: 10 },
    { name: '獨立防塵蓋', qty: items.coverSingle, price: 15 },
    { name: 'Chiikawa防塵蓋', qty: items.coverChiikawa, price: 30 },
    { name: 'Usagi防塵蓋', qty: items.coverUsagi, price: 30 },
    { name: 'Hachiware防塵蓋', qty: items.coverHachiware, price: 30 },
    { name: 'Miffy防塵蓋 (有耳朵版本)', qty: items.coverMiffyEar, price: 30 },
    { name: '近鏡Miffy防塵蓋', qty: items.coverMiffy, price: 30 },
    { name: '叫人鐘 (正常版本)', qty: items.clickerCallbellNormal, price: 78 },
    { name: '叫人鐘 (舉中指版本)', qty: items.clickerCallbellFinger, price: 78 },
    { name: '叫人鐘收聲先 (正常版本)', qty: items.clickerCallcarNormal, price: 145 },
    { name: '叫人鐘收聲先 (舉中指版本)', qty: items.clickerCallcarFinger, price: 145 },
    { name: '粉紅白吉床', qty: items.clickerLuckyPink, price: 68 },
    { name: '藍白吉床', qty: items.clickerLuckyBlue, price: 68 },
    { name: '吉床套裝 (粉紅白吉床x1, 藍白吉床x1)', qty: items.clickerCombo, price: 125 },
    { name: '收聲先', qty: items.clickerShutUp, price: 78 },
    { name: '不想上班鎖匙扣', qty: items.keyringNoWork, price: 28 },
    { name: '如意吉場鎖匙扣', qty: items.keyringLucky, price: 28 },
    { name: '💰 補錢湊數', qty: 1, price: items.addonDiff }
  ].filter(p => p && (p.name === '💰 補錢湊數' ? p.price > 0 : p.qty > 0));

  const methodMap: any = { 
    post: "本地平郵 (包郵)", 
    sf_station: isFreeSF ? "順豐站 (免運)" : "順豐站 (到付)", 
    sf_locker: isFreeSF ? "智能櫃 (免運)" : "智能櫃 (到付)",
    sf_store: "順豐合作便利店 (到付)",
    sf_direct: "順豐送上門 (到付)" 
  };
  const addressPlaceholder: any = {
    post: '✉️ 請填平郵收件地址：屋苑、座數、樓層、室',
    sf_station: '🏪 請填順豐站點碼（如 852XXX）同站名，方便直接對賬',
    sf_locker: '📦 請填智能櫃點碼同櫃位置（如 H852XXX）',
    sf_store: '🏬 請填順豐合作便利店點碼同店舖地址',
    sf_direct: '🏠 請填送貨上門地址：屋苑、座數、樓層、室'
  };

  // ======= 💧 IV Drip Rate 計算邏輯 =======
  const numVol = typeof ivVolume === 'number' ? ivVolume : parseFloat(ivVolume) || 0;
  const numDrop = typeof ivDropFactor === 'number' ? ivDropFactor : parseFloat(ivDropFactor) || 0;
  const numTime = typeof ivTime === 'number' ? ivTime : parseFloat(ivTime) || 0;

  const totalMins = ivTimeUnit === 'hrs' ? numTime * 60 : numTime;
  const rawGttPerMin = totalMins > 0 ? (numVol * numDrop) / totalMins : 0;
  const gttPerMin = Math.round(rawGttPerMin);
  const dropsIn10Sec = Math.round(rawGttPerMin / 6);

  const getClinicalRhythm = (rate: number) => {
    if (!rate || rate <= 0) return { sec: 0, drops: 0, text: '---' };
    
    const dps = rate / 60; // drops per second
    let best = { sec: 1, drops: 1, err: Infinity };

    for (let drops = 1; drops <= 10; drops++) {
      const exactSec = drops / dps;
      const sec = Math.round(exactSec);
      if (sec >= 1 && sec <= 60) {
        const approxDps = drops / sec;
        const err = Math.abs(approxDps - dps) / dps;
        const score = err + (sec * 0.005) + (drops * 0.005);
        if (score < best.err) {
          best = { sec, drops, err: score };
        }
      }
    }

    return {
      sec: best.sec,
      drops: best.drops,
      text: `約 ${best.sec} 秒 ${best.drops} 滴`
    };
  };

  const rhythm = getClinicalRhythm(rawGttPerMin);

  const update = (f: string, d: number) => setItems(p => ({ ...p, [f]: Math.max(0, (p as any)[f] + d) }));
  const changeCoverQty = (colorKey: string, delta: number) => {
    setCoverColors((prev) => {
      const addonQty = Math.max(0, Math.floor(Number(items.coverAddon) || 0));
      if (addonQty <= 0) return null;
      const current = { ...(prev == null ? defaultCoverColors(items, addonQty) : normalizeCoverColors(prev, addonQty)) };
      const assigned = coverSum(current);
      if (delta > 0) {
        if (assigned < addonQty) {
          current[colorKey] = (current[colorKey] || 0) + 1;
        } else {
          const donor = [...TAPE_COLORS]
            .filter((color) => color.key !== colorKey && (current[color.key] || 0) > 0)
            .sort((a, b) => (current[b.key] - current[a.key]) || TAPE_COLORS.indexOf(b) - TAPE_COLORS.indexOf(a))[0];
          if (!donor) return prev;
          current[donor.key] -= 1;
          if (current[donor.key] <= 0) delete current[donor.key];
          current[colorKey] = (current[colorKey] || 0) + 1;
        }
      } else if ((current[colorKey] || 0) > 0) {
        current[colorKey] -= 1;
        if (current[colorKey] <= 0) delete current[colorKey];
      } else {
        return prev;
      }
      return sameCoverMap(current, defaultCoverColors(items, addonQty)) ? null : current;
    });
  };
  const resetCoverColors = () => setCoverColors(null);
  const clearAll = () => {
    if (confirm("確定要清除所有已選商品？收貨資料會保留。")) {
      setItems(initialItems);
      setEmoGiftRn(null);
      setCoverColors(null);
      setCoverEditorOpen(false);
    }
  };
  const clearShipping = () => {
    if (confirm("確定要清空配送及個人資料？已選商品會保留。")) {
      setShipping({ name: '', phone: '', igName: '', address: '', method: 'sf_station', remarks: '' });
    }
  };

  const coverRemark = (() => {
    const detail = addonCoverDetail(items, coverColors);
    if (!detail) return '';
    return detail.startsWith('跟座身：') ? `防塵蓋${detail}` : `防塵蓋：${detail}`;
  })();
  const remarkOutput = [shipping.remarks.trim(), coverRemark].filter(Boolean).join('\n');

  const orderText = [
    'NurseForgeHK 執貨單',
    `請付：HKD $${total}`,
    `單號：${orderId || '---'}${isPromoApplied ? ' (MK)' : ''}`,
    `日期：${today || '---'}`,
    `IG：@${shipping.igName.trim() || '---'}`,
    `姓名：${shipping.name.trim() || '---'}`,
    `電話：${shipping.phone.trim() || '---'}`,
    `運送：${methodMap[shipping.method] || '---'}`,
    `地址：${shipping.address.trim() || '未填寫'}`,
    remarkOutput ? `備註：${remarkOutput}` : '',
    isPromoApplied ? `優惠：已用九折（原價 HKD $${rawTotal}）` : '',
    '',
    '貨品：',
    ...(activeProducts.length
      ? activeProducts.map((p) => `- ${p.name} x${p.shipQty ?? p.qty}${p.detail ? `（${p.detail}）` : ''}  $${p.lineTotal ?? p.qty * p.price}`)
      : ['- （未揀商品）']),
    '',
    `總額：HKD $${total}`
  ].filter(line => line !== '').join('\n');

  const copyOrder = () => {
    const legacyOk = copyPlainText(orderText);
    const finish = (ok: boolean) => {
      if (ok) {
        setCopyState('copied');
        setCopyFallback('');
      } else {
        setCopyState('failed');
        setCopyFallback(orderText);
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(orderText).then(() => finish(true)).catch(() => finish(legacyOk));
    } else {
      finish(legacyOk);
    }
  };

  useEffect(() => {
    setCopyState('idle');
    setCopyFallback('');
  }, [orderText]);

  const paymeLockedReason = !hasRealProducts
    ? '請先揀選至少一件商品'
    : !agreed
    ? '請先剔選上方聲明'
    : shipping.name.trim() === '' || shipping.phone.trim() === '' || shipping.igName.trim() === '' || shipping.address.trim() === ''
    ? '請填妥姓名/IG/電話/詳細地址'
    : copyState !== 'copied'
    ? '請先複製訂單文字，再去 PayMe'
    : '';

  const renderCopyButton = () => (
    <button
      type="button"
      onClick={copyOrder}
      disabled={!hasRealProducts}
      style={{
        display: 'block',
        width: '100%',
        marginTop: '8px',
        padding: '12px',
        backgroundColor: !hasRealProducts ? '#e0e0e0' : copyState === 'copied' ? '#2E7D32' : '#111',
        color: !hasRealProducts ? '#666' : '#fff',
        border: 'none',
        borderRadius: '30px',
        fontWeight: 900,
        fontSize: '15px',
        cursor: hasRealProducts ? 'pointer' : 'not-allowed'
      }}
    >
      {!hasRealProducts ? '請先揀選商品先可以複製' : copyState === 'copied' ? '已複製，撳多次都得' : copyState === 'failed' ? '再試一次複製' : '複製訂單文字'}
    </button>
  );

  if (!draftReady) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#77815C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '28px' }}>
        NurseForgeHK
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 15px 230px 15px', backgroundColor: '#77815C', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
      {photoPreview && <PhotoLightbox src={photoPreview.src} title={photoPreview.title} onClose={() => setPhotoPreview(null)} />}

      {/* 🎆 全螢幕煙花 Canvas */}
      {showFireworks && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}

      <style>{`
        @keyframes unlockWobble {
          0% { transform: scale(1); }
          15% { transform: scale(1.04) rotate(-1deg); }
          30% { transform: scale(1.04) rotate(1deg); }
          45% { transform: scale(1.04) rotate(-1deg); }
          60% { transform: scale(1.04) rotate(1deg); }
          75% { transform: scale(1.04) rotate(0deg); }
          100% { transform: scale(1); }
        }
        .payme-active-btn {
          animation: unlockWobble 0.5s ease-in-out;
        }

        /* 🔘 按鈕實體按壓動感樣式 */
        .btn-3d {
          box-shadow: 0 2px 0 #d0d0d0, 0 3px 5px rgba(0,0,0,0.1);
          transition: all 0.08s ease;
          user-select: none;
        }
        .btn-3d:active {
          transform: translateY(1.5px);
          box-shadow: 0 0.5px 0 #d0d0d0, 0 1px 2px rgba(0,0,0,0.1);
        }

        .btn-3d-diff {
          box-shadow: 0 2.5px 0 #b02065, 0 3px 6px rgba(0,0,0,0.1);
          transition: all 0.08s ease;
          user-select: none;
        }
        .btn-3d-diff:active {
          transform: translateY(1.5px);
          box-shadow: 0 0.5px 0 #b02065, 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>

      <button type="button" onClick={() => setShowIvCalc(true)} style={fabLeftStyle}>
        💧 點滴計算器
      </button>
      <button
        type="button"
        onClick={() => { setCodeCopyState('idle'); setCodeUnlocked(false); setCodePassword(''); setCodePasswordWrong(false); setShowCodes(true); }}
        style={fabRightStyle}
      >
        貨品代碼
      </button>

      <div style={{ textAlign: 'center', marginBottom: '20px', color: '#fff', paddingTop: '50px' }}>
        <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '2px', marginBottom: '2px', opacity: 0.95 }}>護士鍛造工場</div>
        <h1 style={{ fontSize: '34px', fontWeight: '900', margin: '0' }}>NurseForgeHK</h1>
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px', opacity: 0.9 }}>by @nursingmeme_hk</p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto 20px auto' }}>
        {/* 🏬 實體體驗店獨立公告卡片 */}
        <div style={{ backgroundColor: '#FFF0F5', border: '1.5px solid #FFB6C1', borderRadius: '14px', padding: '12px 14px', marginBottom: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', color: '#000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', borderBottom: '1.5px solid #FFC0CB', paddingBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>🏬</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#B81D13', flex: 1 }}>
              實體體驗店現已登場！
            </h3>
          </div>

          <div style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.5', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>📍 <b>地點：</b>旺角中心 3 樓 T67 號舖（A44 格）</div>
            <div>⏰ <b>營業時間：</b>14:00 - 22:00</div>
            <div>🚶 <b>指路：</b>一入鋪頭左手邊（<span style={{ color: '#D63384', fontWeight: '800' }}>@hknurse_shop</span> 正右手邊）</div>
            <div style={{ marginTop: '2px', color: '#D63384', backgroundColor: '#fff', padding: '6px 8px', borderRadius: '8px', border: '1px solid #FFD1DC', fontSize: '12px', fontWeight: 'bold' }}>
              🎁 現場擺有解壓神器及鑰匙扣樣本，附<b>門市限定優惠碼</b>！
            </div>
          </div>
        </div>

        {/* 📢 店主公告 */}
        <div style={announcementStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '20px', lineHeight: '1.2' }}>📢</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '900', color: '#856404', borderBottom: '1.5px solid #FFE8A3', paddingBottom: '4px' }}>
                店主公告
              </h3>
              
              <div style={{ fontSize: '12.5px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>1. ✨ <b>全店滿 $200 即包順豐站/智能櫃運費！</b></div>
                
                <div>2. 🔥 <b>新貨上架：</b>「emo人員」鎖匙扣有 RN、APN 兩個版本！買俾身邊成日都 emo 嘅 lo best 啦，一人一個，一齊 emo！🖤（買五送一，兩個版本可以夾）</div>
                
                <div style={{ paddingTop: '5px', borderTop: '1px dashed #E6C200' }}>
                  3. 📦 <b>膠紙座出貨說明：</b>
                  <div style={{ paddingLeft: '4px', marginTop: '2px', fontSize: '12px', fontWeight: '600' }}>
                    🚚 <b>順豐速遞：</b>完整組裝好（連螺絲扭緊）先寄出，加購防塵蓋一併入盒，收到即刻用得！<br />
                    ✉️ <b>本地平郵：</b>受郵政厚度限制，會以零件（散件）寄出。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>揀商品（撳「加入」落單，撳圖睇大圖）</h2>

        <div style={{ marginBottom: '26px' }}>
          <CatalogTitle>膠紙座</CatalogTitle>
          <div style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold', marginBottom: '10px' }}>⚙️ 膠紙座旋轉中軸已統一用白色 PETG</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
            <ShowcaseCardMini img="/whitetape.jpg" title="白色膠紙座" price="$58" actions={[{ key: 'tapeWhite' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
            <ShowcaseCardMini img="/greytape.jpg" title="灰色膠紙座" price="$58" actions={[{ key: 'tapeGrey' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '900', color: '#111', lineHeight: 1.5 }}>
            白色、灰色膠紙座 <span style={{ color: '#77815C' }}>$58</span>　·　其餘顏色 <span style={{ color: '#B91C1C' }}>$78</span>
          </div>

        <div style={{ marginBottom: '0' }}>
          <button
            type="button"
            onClick={() => setShowColorPreview(!showColorPreview)}
            style={{
              width: '100%',
              padding: '16px 16px 14px',
              backgroundColor: '#fff',
              color: '#111',
              border: '3px solid #111',
              borderRadius: '18px',
              cursor: 'pointer',
              boxShadow: '0 5px 0 #111',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '26px', lineHeight: 1 }}>🎨</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '17px', fontWeight: '900', lineHeight: 1.25 }}>
                  {showColorPreview ? '收起膠紙座色卡' : '展開全部膠紙座色卡'}
                </span>
                <span style={{ display: 'block', marginTop: '2px', fontSize: '12px', fontWeight: '700', color: '#444' }}>
                  {showColorPreview ? '撳一下收起' : '白色、灰色 $58，其餘顏色 $78'}
                </span>
              </span>
              <span style={{ fontSize: '18px', fontWeight: '900' }}>{showColorPreview ? '▲' : '▼'}</span>
            </span>
            <span style={{ display: 'flex', gap: '5px' }}>
              {['#ffffff', '#9ca3af', '#111111', '#dc2626', '#f59e0b', '#f472b6', '#38bdf8', '#84cc16', '#a855f7', '#d6d3d1'].map((color) => (
                <span key={color} style={{ flex: 1, height: '14px', borderRadius: '7px', backgroundColor: color, border: '1px solid rgba(0,0,0,0.18)' }} />
              ))}
            </span>
          </button>

          {showColorPreview && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '18px', marginTop: '12px', color: '#fff' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px', textAlign: 'center', lineHeight: 1.5 }}>
                🎨 其餘顏色全部 $78（白色、灰色 $58）<br />撳圖睇大圖，撳加入就落單
              </div>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#FFE8A3', marginBottom: '4px' }}>
                  ✨ PLA Matta (啞光物料)
                </div>
                <div style={{ fontSize: '10px', color: '#fff', marginBottom: '8px', opacity: 0.9 }}>
                  💡 註：選用此物料的膠紙座，<b>底部將會配搭白色</b>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { img: 'pink', name: '櫻花粉', key: 'tapePink' },
                    { img: 'seablue', name: '海洋藍', key: 'tapeOceanBlue' },
                    { img: 'iceblue', name: '冰藍', key: 'tapeIceBlue' },
                    { img: 'usagiyellow', name: '沙漠黃 (Usagi黃)', key: 'tapeDesertYellow' },
                    { img: 'applegreen', name: '青蘋果綠', key: 'tapeAppleGreen' }
                  ].map((color) => (
                    <ColorShowcaseMini key={color.key} img={`/${color.img}.jpg`} title={color.name} sub="白底" price="$78" count={(items as any)[color.key]} onAdd={() => update(color.key, 1)} onSub={() => update(color.key, -1)} />
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  🔹 PLA Basic (標準光面物料)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { img: 'white', name: '白色', key: 'tapeWhite', price: '$58' }, { img: 'grey', name: '灰色', key: 'tapeGrey', price: '$58' }, 
                    { img: 'black', name: '黑色', key: 'tapeBlack', price: '$78' }, { img: 'red', name: '深紅', key: 'tapeRed', price: '$78' }, 
                    { img: 'warmyellow', name: '暖黃', key: 'tapeYellow', price: '$78' }, { img: 'orange', name: '橙色', key: 'tapeOrange', price: '$78' },
                    { img: 'purple', name: '紫色', key: 'tapePurple', price: '$78' }, { img: 'green', name: '綠色', key: 'tapeGreen', price: '$78' }
                  ].map((color) => (
                    <ColorShowcaseMini key={color.key} img={`/${color.img}.jpg`} title={color.name} price={color.price} count={(items as any)[color.key]} onAdd={() => update(color.key, 1)} onSub={() => update(color.key, -1)} />
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#FFE8A3', marginBottom: '4px' }}>
                  🏛️ PLA 獨立材料
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  <ColorShowcaseMini img="/marble.jpg" title="大理石" sub="獨立材料" price="$78" count={items.tapeMarble} onAdd={() => update('tapeMarble', 1)} onSub={() => update('tapeMarble', -1)} />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        <div style={{ marginBottom: '26px' }}>
          <CatalogTitle>標準防塵蓋</CatalogTitle>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '12px 14px', marginBottom: '12px', color: '#000' }}>
            <Row name="隨座加購防塵蓋 $10" count={items.coverAddon} onAdd={() => update('coverAddon', 1)} onSub={() => update('coverAddon', -1)} />
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#444', lineHeight: 1.5 }}>
              膠紙座本身唔包防塵蓋。加購 $10 先有蓋，顏色預設跟座身。
            </p>
            <AddonCoverPicker
              items={items}
              tapeCount={totalTapeCount}
              coverColors={coverColors}
              open={coverEditorOpen}
              onToggle={() => setCoverEditorOpen((prev) => !prev)}
              onDelta={changeCoverQty}
              onReset={resetCoverColors}
            />
            <Row name="補買防塵蓋 $15" count={items.coverSingle} onAdd={() => update('coverSingle', 1)} onSub={() => update('coverSingle', -1)} />
            {showCoverRemarkNotice && (
              <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: '#FFF9E6', border: '1px dashed #FFCC00', borderRadius: '10px', fontSize: '12px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.5' }}>
                ⚠️ 你揀咗多款顏色嘅膠紙座，公仔蓋或者補買防塵蓋請喺下面備註寫低想配邊個座
              </div>
            )}
          </div>
          <a href="https://www.instagram.com/p/DW3pJ1zkuY4/" target="_blank" rel="noreferrer" style={{ ...igLinkBtnStyle, display: 'block', width: '100%', padding: '12px 14px', fontSize: '14px' }}>🛡️ 點解要加防塵蓋？</a>
        </div>

        <div style={{ marginBottom: '26px' }}>
          <CatalogTitle>特別版防塵蓋</CatalogTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
            <ShowcaseCardMini img="/chi.jpg" title="Chiikawa防塵蓋" price="$30" actions={[{ key: 'coverChiikawa' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
            <ShowcaseCardMini img="/us.jpg" title="Usagi防塵蓋" price="$30" actions={[{ key: 'coverUsagi' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
            <ShowcaseCardMini img="/ha.jpg" title="Hachiware防塵蓋" price="$30" actions={[{ key: 'coverHachiware' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <ShowcaseCardMini img="/miffyear.jpg" title="Miffy防塵蓋 (有耳朵版本)" price="$30" actions={[{ key: 'coverMiffyEar' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
            <ShowcaseCardMini img="/miffy.jpg" title="近鏡Miffy防塵蓋" price="$30" actions={[{ key: 'coverMiffy' }]} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
          </div>
        </div>

        <div style={{ marginBottom: '26px' }}>
          <CatalogTitle>Clicker 系列</CatalogTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {[
            { img: 'pbed', title: '粉紅白吉床', price: '$68', actions: [{ key: 'clickerLuckyPink' }] },
            { img: 'bbed', title: '藍白吉床', price: '$68', actions: [{ key: 'clickerLuckyBlue' }] },
            { img: 'twobed', title: '吉床套裝 (粉紅白x1+藍白x1)', price: '$125', actions: [{ key: 'clickerCombo' }] },
            { img: 'cm', title: '收聲先', price: '$78', actions: [{ key: 'clickerShutUp' }] }
          ].map((item) => (
            <ShowcaseCardMini key={item.img} img={`/${item.img}.jpg`} title={item.title} price={item.price} actions={item.actions} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {[
            { img: 'callbell', title: '叫人鐘', price: '$78', actions: [{ key: 'clickerCallbellNormal', label: '正常' }, { key: 'clickerCallbellFinger', label: '中指' }] },
            { img: 'callcar', title: '叫人鐘收聲先', price: '$145', actions: [{ key: 'clickerCallcarNormal', label: '正常' }, { key: 'clickerCallcarFinger', label: '中指' }] }
          ].map((item) => (
            <ShowcaseCardMini key={item.img} img={`/${item.img}.jpg`} title={item.title} price={item.price} actions={item.actions} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
          ))}
        </div>
        </div>

        <div style={{ marginBottom: '26px' }}>
          <CatalogTitle>鎖匙扣系列</CatalogTitle>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            border: '3px solid #111827',
            marginBottom: '12px',
            color: '#000'
          }}>
            <div style={{
              backgroundColor: '#111827',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>🖤</span>
                <span style={{ fontSize: '15px', fontWeight: '900', color: '#fff' }}>
                  「emo人員」鎖匙扣
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', backgroundColor: '#dc2626', color: '#fff', padding: '2px 7px', borderRadius: '10px', fontWeight: '900' }}>
                  買5送1
                </span>
                <span style={{ fontSize: '12px', backgroundColor: '#374151', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                  $38 / 個
                </span>
              </div>
            </div>
            <img
              src="/emo-versions.jpg"
              alt="「emo人員」鎖匙扣 RN 同 APN"
              fetchPriority="high"
              decoding="async"
              onClick={() => openPhotoPreview('/emo-versions.jpg', '「emo人員」鎖匙扣 RN / APN')}
              style={{ width: '100%', height: 'auto', display: 'block', cursor: 'zoom-in', backgroundColor: '#F3F4F6' }}
            />
            <div style={{ padding: '8px 14px', backgroundColor: '#fff', fontSize: '12px', fontWeight: '800', color: '#374151', textAlign: 'center' }}>
              左：APN（紅框）　·　右：RN（間條）
            </div>
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', fontSize: '12.5px', color: '#1F2937', fontWeight: 'bold', lineHeight: '1.6' }}>
              <div>🖤 <b>買俾身邊成日都 emo 嘅 lo best 啦，一人一個，一齊 emo！</b></div>
              <div style={{ color: '#374151', fontSize: '12px', marginTop: '3px' }}>📏 <b>尺寸：</b>約 3cm × 6cm　·　RN、APN 都係 $38</div>
              <div style={{ color: '#4B5563', fontSize: '12px', marginTop: '2px' }}>✉️ 產品夠細可以擺入去本地平郵信封包郵（平郵冇追蹤功能，寄失自負）</div>
              <div style={{ color: '#B91C1C', fontSize: '12px', fontWeight: '900', marginTop: '4px', backgroundColor: '#FEF2F2', padding: '6px 10px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                🎉 <b>買五送一</b>：兩個版本一齊計，買 5 個實出 6 個。送邊款你揀。
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '900', marginBottom: '2px' }}>RN　$38</div>
                  <PreviewAdd count={items.keyringEmoRn} onAdd={() => update('keyringEmoRn', 1)} onSub={() => update('keyringEmoRn', -1)} addText="加入 RN" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '900', marginBottom: '2px' }}>APN　$38</div>
                  <PreviewAdd count={items.keyringEmoApn} onAdd={() => update('keyringEmoApn', 1)} onSub={() => update('keyringEmoApn', -1)} addText="加入 APN" />
                </div>
              </div>
              {emoPaid > 0 && emoFree === 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#9A3412' }}>
                  已選 {emoPaid} 個，再買多 {5 - (emoPaid % 5)} 個就送 1 個。
                </div>
              )}
              {emoFree > 0 && (
                <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#ECFDF5', border: '1.5px solid #10B981', borderRadius: '10px', fontSize: '12px', color: '#065F46', fontWeight: 'bold', lineHeight: '1.5' }}>
                  <div>付款 {emoPaid} 個，送 {emoFree} 個，實出 {emoPaid + emoFree} 個。</div>
                  <div style={{ marginTop: '6px' }}>送邊款（可以夾）：</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <button type="button" onClick={() => setEmoGiftRn(Math.max(0, emoGiftRnCount - 1))} style={btnStyle}>-</button>
                      <span>RN {emoGiftRnCount}</span>
                      <button type="button" onClick={() => setEmoGiftRn(Math.min(emoFree, emoGiftRnCount + 1))} style={btnStyle}>+</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <button type="button" onClick={() => setEmoGiftRn(Math.min(emoFree, emoGiftRnCount + 1))} style={btnStyle}>-</button>
                      <span>APN {emoGiftApnCount}</span>
                      <button type="button" onClick={() => setEmoGiftRn(Math.max(0, emoGiftRnCount - 1))} style={btnStyle}>+</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '6px' }}>實出 RN {items.keyringEmoRn + emoGiftRnCount} 個、APN {items.keyringEmoApn + emoGiftApnCount} 個。</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { img: 'sick', title: '不想上班', price: '$28', actions: [{ key: 'keyringNoWork' }] },
              { img: 'kc', title: '如意吉場', price: '$28', actions: [{ key: 'keyringLucky' }] }
            ].map((item) => (
              <ShowcaseCardMini key={item.img} img={`/${item.img}.jpg`} title={item.title} price={item.price} actions={item.actions} countOf={(key: string) => (items as any)[key]} onAdd={(key: string) => update(key, 1)} onSub={(key: string) => update(key, -1)} />
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF9E6', border: '2px dashed #FFCC00', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', fontSize: '13px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.5' }}>
          💡 鎖匙扣或者解壓神器都可以獨立訂造顏色，詳情另外諮詢 📩
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={formCardStyle}>
          <Section
            title="🚚 配送及個人資訊"
            action={
              <button type="button" onClick={clearShipping} style={{ ...clearBtnStyle, padding: '6px 10px', fontSize: '12px', flexShrink: 0 }}>
                清空個人資料
              </button>
            }
          >
            <p style={privacyNoticeStyle}>🛡️ 訂單只會留喺你部手機，方便去完 PayMe 返嚟再複製。網站唔會把資料上傳。</p>
            {hasClicker && <p style={{ color: '#dc3545', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ 由於選購了 Clicker，只能選順豐。</p>}
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="收件人姓名 (必填)" style={inputStyle} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
              <input placeholder="IG 帳號 (必填，方便搵返你)" style={inputStyle} value={shipping.igName} onChange={e => setShipping({...shipping, igName: e.target.value})} />
            </div>
            <input placeholder="聯絡電話 (必填)" style={inputStyle} value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '4px 0 12px' }}>
              {!hasClicker && <Radio label="本地平郵 (包郵)" active={shipping.method === 'post'} onClick={() => setShipping({...shipping, method: 'post'})} />}
              <Radio label={isFreeSF ? "順豐站 (免運)" : "順豐站 (到付)"} active={shipping.method === 'sf_station'} onClick={() => setShipping({...shipping, method: 'sf_station'})} />
              <Radio label={isFreeSF ? "智能櫃 (免運)" : "智能櫃 (到付)"} active={shipping.method === 'sf_locker'} onClick={() => setShipping({...shipping, method: 'sf_locker'})} />
              <Radio label="便利店 (到付)" active={shipping.method === 'sf_store'} onClick={() => setShipping({...shipping, method: 'sf_store'})} />
              <Radio label="送上門 (到付)" active={shipping.method === 'sf_direct'} onClick={() => setShipping({...shipping, method: 'sf_direct'})} />
            </div>
            
            <textarea 
              placeholder={addressPlaceholder[shipping.method]} 
              style={{...inputStyle, height: '80px'} as any} 
              value={shipping.address} 
              onChange={e => setShipping({...shipping, address: e.target.value})} 
            />
            
            {showCoverRemarkNotice && (
              <div style={{ marginBottom: '8px', padding: '10px 12px', backgroundColor: '#FFF9E6', border: '1px dashed #FFCC00', borderRadius: '10px', fontSize: '12px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.5' }}>
                ⚠️ 你揀咗多款顏色嘅膠紙座，公仔蓋或者補買防塵蓋請喺備註寫低想配邊個座
              </div>
            )}
            <input placeholder="備註 (Remarks) (例如：防塵蓋要灰色 / 配邊個座)" style={{...inputStyle, border: showCoverRemarkNotice ? '2px solid #FFCC00' : '2px solid #77815C', backgroundColor: showCoverRemarkNotice ? '#FFF9E6' : '#fff'} as any} value={shipping.remarks} onChange={e => setShipping({...shipping, remarks: e.target.value})} />
            
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#F4F6F0', borderRadius: '12px', border: '1px solid #77815C' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#77815C', display: 'block', marginBottom: '6px' }}>
                🎟️ 優惠碼 (請輸入大楷字母):
              </label>
              <input 
                placeholder="輸入優惠碼" 
                style={{...inputStyle, marginBottom: '0', textTransform: 'uppercase'}} 
                value={promoCode} 
                onChange={e => { setAllowFireworks(true); setPromoCode(e.target.value.toUpperCase()); }} 
              />
              {isPromoApplied ? (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#2E7D32', fontWeight: 'bold' }}>
                  🎉 已成功獲得九折優惠！
                </div>
              ) : promoCode.trim() !== '' ? (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>
                  ❌ 優惠碼無效，請確認格式是否正確
                </div>
              ) : null}
            </div>

            <div style={addonCardStyle}>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#D63384' }}>💰 補錢湊數：${items.addonDiff}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => update('addonDiff', -1)} className="btn-3d-diff" style={diffBtnStyle}>-1</button>
                <button type="button" onClick={() => update('addonDiff', 1)} className="btn-3d-diff" style={diffBtnStyle}>+1</button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 📸 醒目落單截圖指引公告 */}
        <div style={capNoticeStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px', fontSize: '17px', fontWeight: '900', color: '#854d0e', textAlign: 'center' }}>
            <span>📋</span>
            <span>【重要必睇】點樣把訂單交俾店主？</span>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #EAB308', textAlign: 'left', fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
            <div style={{ paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: '#1f2937' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ backgroundColor: '#FEF08A', color: '#854d0e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>步驟 1</span>
                <span><b>撳「複製訂單文字」</b>（執貨單唔使再截圖）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ backgroundColor: '#FEF08A', color: '#854d0e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>步驟 2</span>
                <span><b>截圖 PayMe 付款成功頁面</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ backgroundColor: '#FEF08A', color: '#854d0e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>步驟 3</span>
                <span>將<b>複製嘅文字同 PayMe 截圖</b>一併 DM Instagram: <a href="https://instagram.com/nurseforgehk" target="_blank" rel="noreferrer" style={{ color: '#D63384', textDecoration: 'underline' }}>@nurseforgehk</a> 📦</span>
              </div>
            </div>
          </div>
        </div>

        <div style={orderDraftStyle}>
          <div style={orderHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#77815C' }}>NurseForgeHK 執貨單</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
              <span>ID: {orderId}{isPromoApplied ? ' (MK)' : ''}</span>
              <span>DATE: {today}</span>
            </div>
          </div>

          <div style={orderInfoBoxStyle}>
             <div><strong>IG:</strong> @{shipping.igName || '---'} | <strong>Name:</strong> {shipping.name || '---'}</div>
             <div><strong>Tel:</strong> {shipping.phone || '---'}</div>
             <div><strong>Ship:</strong> {methodMap[shipping.method]}</div>
             <p style={addressPreviewStyle}><strong>Addr:</strong> {shipping.address || '未填寫'}</p>
             {remarkOutput && (
               <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#FFF5F7', borderRadius: '4px', borderLeft: '3px solid #D63384', fontSize: '11px', color: '#000', whiteSpace: 'pre-line' }}>
                 <strong>備註:</strong> {remarkOutput}
               </div>
             )}
             {isPromoApplied && (
               <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#E8F5E9', borderRadius: '4px', borderLeft: '3px solid #2E7D32', fontSize: '11px', color: '#2E7D32', fontWeight: 'bold' }}>
                 <strong>優惠:</strong> 已套用九折優惠碼
               </div>
             )}
          </div>
          <div style={{ minHeight: '40px' }}>
            {activeProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                  {p.name} <b style={{ color: '#77815C' }}>x{p.shipQty ?? p.qty}</b>
                  {p.detail && <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#3f4a2e' }}>{p.detail}</span>}
                </span>
                <span style={{ fontWeight: 'bold', flexShrink: 0 }}>${p.lineTotal ?? p.qty * p.price}</span>
              </div>
            ))}
          </div>
          <div style={orderTotalAreaStyle}>
            {isPromoApplied && (
              <div style={{ fontSize: '12px', color: '#888', textDecoration: 'line-through' }}>
                原價: HKD ${rawTotal}
              </div>
            )}
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#77815C' }}>Total: HKD ${total}</div>
          </div>
          {renderCopyButton()}
          {copyState === 'copied' && (
            <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#166534', textAlign: 'center', lineHeight: 1.5 }}>
              已複製。去 PayMe 同 IG 之後返嚟，張單仍然喺度，可以再複製。
            </div>
          )}
          <div style={quoteAreaStyle}>✨ {randomQuote}</div>
        </div>

        {copyFallback && (
          <div style={{ width: '95%', maxWidth: '380px', marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '12px', border: '3px solid #dc2626' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#991b1b', lineHeight: 1.5 }}>
              呢個瀏覽器未複製到。請長按下面文字，揀「複製」，然後撳「我已經複製好」。
            </p>
            <textarea
              ref={copyFallbackRef}
              readOnly
              value={copyFallback}
              style={{ width: '100%', height: '180px', fontSize: '13px', lineHeight: 1.45, padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            <button
              type="button"
              onClick={() => { setCopyState('copied'); setCopyFallback(''); }}
              style={{ display: 'block', width: '100%', marginTop: '8px', padding: '12px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 900, cursor: 'pointer' }}
            >
              我已經複製好
            </button>
          </div>
        )}

        <div style={agreementBoxStyle}>
          <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} style={{ width: '24px', height: '24px', marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 4px 0' }}>1. 我確認以上購買項目及物流資料正確無誤</p>
              <p style={{ margin: '0 0 4px 0' }}>2. 我明白 3D 打印貨品不設退換</p>
              <p style={{ margin: 0 }}>3. 我知悉如選擇本地平郵，寄失風險自付</p>
            </div>
          </label>
        </div>
      </div>

      {showIvCalc && (
        <div onClick={() => setShowIvCalc(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17,17,17,0.62)', zIndex: 2500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '28px 12px', overflowY: 'auto' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{
          backgroundColor: '#FFF8F0',
          borderRadius: '24px',
          padding: '20px 16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          color: '#000',
          border: '3.5px solid #DD6B20',
          position: 'relative'
        }}>
          <button
            type="button"
            aria-label="關閉點滴計算器"
            onClick={() => setShowIvCalc(false)}
            style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #111', backgroundColor: '#fff', color: '#111', fontSize: '22px', fontWeight: '900', lineHeight: 1, cursor: 'pointer' }}
          >
            ×
          </button>
          <h3 style={{ margin: '0 40px 14px 0', fontSize: '18px', fontWeight: '900', color: '#DD6B20' }}>
            💧 點滴直式
          </h3>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#9C4221', marginBottom: '4px' }}>容量</div>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #DD6B20', borderRadius: '12px', padding: '4px 8px' }}>
                  <input
                    type="number"
                    value={ivVolume}
                    onChange={e => setIvVolume(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ width: '72px', fontSize: '22px', fontWeight: '900', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#9C4221' }}>mL</span>
                </div>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#DD6B20', paddingBottom: '6px' }}>×</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#9C4221', marginBottom: '4px' }}>滴數</div>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #DD6B20', borderRadius: '12px', padding: '4px 8px' }}>
                  <input
                    type="number"
                    value={ivDropFactor}
                    onChange={e => setIvDropFactor(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ width: '56px', fontSize: '22px', fontWeight: '900', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#9C4221' }}>gtt/mL</span>
                </div>
              </div>
            </div>

            <div style={{ height: '3px', backgroundColor: '#DD6B20', margin: '12px 4px', borderRadius: '2px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#9C4221', marginBottom: '4px' }}>時間</div>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #DD6B20', borderRadius: '12px', padding: '4px 8px' }}>
                  <input
                    type="number"
                    value={ivTime}
                    onChange={e => setIvTime(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ width: '64px', fontSize: '22px', fontWeight: '900', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent' }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIvTimeUnit(u => u === 'mins' ? 'hrs' : 'mins')}
                style={{
                  backgroundColor: '#DD6B20',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '15px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  marginBottom: '2px'
                }}
              >
                {ivTimeUnit === 'mins' ? '分鐘' : '小時'}
              </button>
              {ivTimeUnit === 'hrs' && (
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#DD6B20', paddingBottom: '8px' }}>× 60</span>
              )}
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            backgroundColor: '#FFEDD5',
            border: '2px solid #F97316',
            borderRadius: '16px',
            padding: '12px 10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', fontWeight: '900', color: '#C05621', lineHeight: 1 }}>{gttPerMin}</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#9A3412', marginTop: '2px' }}>滴/分鐘</div>
            {rawGttPerMin > 0 && (
              <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: '800', color: '#7B341E' }}>
                {rhythm.text} · 10 秒 {dropsIn10Sec} 滴
              </div>
            )}
          </div>
        </div>
        </div>
        </div>
      )}

      <div style={footerStyle}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          
          <div style={bottomTotalCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                 <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>總額：</span>
                 <span style={{ fontSize: '18px', fontWeight: '900', color: '#77815C' }}>
                   HKD ${total}
                 </span>
                 {isPromoApplied && <span style={{ fontSize: '10px', color: '#2E7D32', fontWeight: 'bold' }}>(已打9折)</span>}
               </div>
               <button type="button" onClick={clearAll} style={clearBtnStyle}>🗑️ 清空</button>
            </div>
            
            <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '5px', paddingTop: '4px', textAlign: 'center', lineHeight: '1.2' }}>
              {!isFreeSF ? (
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#b97a00' }}>
                  💡 再買多 <b style={{ fontSize: '12px', color: '#dc3545' }}>${200 - total}</b> 享順豐站/智能櫃免運費！
                </span>
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2E7D32' }}>
                  🎉 已滿 $200！已享順豐站/智能櫃免運費！
                </span>
              )}
            </div>
          </div>
          
          {renderCopyButton()}
          <div style={{ marginTop: '6px' }}>
            {paymeLockedReason === '' ? (
              <button
                type="button"
                className="payme-active-btn"
                style={{ ...paymeBtnStyle, border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  copyOrder();
                  window.open('https://payme.hsbc/nfhk', '_blank', 'noopener,noreferrer');
                }}
              >
                🌟 立即 PayMe 付款
              </button>
            ) : (
              <div style={paymeBtnDisabledStyle}>
                {paymeLockedReason}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '6px', textAlign: 'center', fontSize: '11px', color: '#888', fontWeight: '700' }}>
            呢個網站係我自己寫㗎:D
          </div>
        </div>
      </div>
      {showCodes && (
        <div onClick={() => setShowCodes(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17,17,17,0.62)', zIndex: 2600, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '28px 12px', overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', backgroundColor: '#fff', borderRadius: '24px', padding: '20px 16px', color: '#111', position: 'relative' }}>
            <button
              type="button"
              aria-label="關閉貨品代碼"
              onClick={() => setShowCodes(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #111', backgroundColor: '#fff', color: '#111', fontSize: '22px', fontWeight: '900', lineHeight: 1, cursor: 'pointer' }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 36px 12px 0', fontSize: '18px', fontWeight: '900', color: '#77815C' }}>貨品代碼</h3>
            {!codeUnlocked ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (codePassword === '0407') {
                    setCodeUnlocked(true);
                    setCodePasswordWrong(false);
                  } else {
                    setCodePasswordWrong(true);
                  }
                }}
              >
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#444' }}>請輸入密碼先睇到代碼。</p>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={codePassword}
                  onChange={(e) => { setCodePassword(e.target.value); setCodePasswordWrong(false); }}
                  placeholder="密碼"
                  style={{ ...inputStyle, marginBottom: '8px' }}
                />
                {codePasswordWrong && <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: '#B91C1C' }}>密碼不正確</p>}
                <button type="submit" style={{ display: 'block', width: '100%', padding: '12px', border: 'none', borderRadius: '30px', backgroundColor: '#111', color: '#fff', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}>
                  進入
                </button>
              </form>
            ) : (
            <>
            <button
              type="button"
              onClick={() => {
                const text = productCodeText();
                const legacyOk = copyPlainText(text);
                const finish = (ok: boolean) => setCodeCopyState(ok ? 'copied' : 'failed');
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(text).then(() => finish(true)).catch(() => finish(legacyOk));
                } else {
                  finish(legacyOk);
                }
              }}
              style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '12px', border: 'none', borderRadius: '30px', backgroundColor: '#111', color: '#fff', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}
            >
              {codeCopyState === 'copied' ? '已複製全部代碼' : '一鍵複製全部代碼'}
            </button>
            {codeCopyState === 'failed' && (
              <textarea readOnly value={productCodeText()} style={{ width: '100%', height: '120px', marginBottom: '12px', fontSize: '12px', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }} />
            )}
            {PRODUCT_CODES.map((item, index) => {
              const showGroup = index === 0 || item.group !== PRODUCT_CODES[index - 1].group;
              return (
                <div key={item.name}>
                  {showGroup && <div style={{ margin: index === 0 ? '0 0 6px' : '12px 0 6px', fontSize: '13px', fontWeight: '900', color: '#77815C' }}>{item.group}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                    <span style={{ fontWeight: '700' }}>{item.name}</span>
                    <span style={{ fontWeight: '900', color: '#111' }}>{item.code}</span>
                    <span style={{ fontWeight: '900', color: '#77815C', minWidth: '42px', textAlign: 'right' }}>${item.price}</span>
                  </div>
                </div>
              );
            })}
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const announcementStyle: any = { backgroundColor: '#FFF9E6', border: '1.5px solid #FFCC00', borderRadius: '14px', padding: '12px 14px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', color: '#000' };
const fabLeftStyle: any = { position: 'absolute', left: '10px', top: '12px', padding: '10px 12px', borderRadius: '20px', backgroundColor: '#fff', color: '#DD6B20', fontWeight: '900', border: '2.5px solid #DD6B20', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1100, fontSize: '11px', cursor: 'pointer' };
const fabRightStyle: any = { position: 'absolute', right: '10px', top: '12px', padding: '10px 12px', borderRadius: '20px', backgroundColor: '#fff', color: '#77815C', fontWeight: '900', border: '2.5px solid #77815C', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1100, fontSize: '11px', cursor: 'pointer' };
const formCardStyle: any = { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', color: '#000' };
const inputStyle: any = { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '15px', marginBottom: '8px' };

// 🔘 升級：低調而有質感的 3D 加減按鈕樣式
const btnStyle: any = { 
  width: '32px', 
  height: '32px', 
  borderRadius: '10px', 
  border: '1px solid #dcdcdc', 
  backgroundColor: '#f8f9fa', 
  fontWeight: 'bold', 
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#444'
};

const footerStyle: any = { position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: '#fff', padding: '8px 12px 12px 12px', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'center', zIndex: 1000, boxShadow: '0 -4px 18px rgba(0,0,0,0.08)' };
const bottomTotalCardStyle: any = { backgroundColor: '#F9FAF6', padding: '6px 10px', borderRadius: '12px', border: '1.5px solid #77815C', marginBottom: '6px' };
const clearBtnStyle: any = { padding: '3px 8px', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#fff' };
const paymeBtnStyle: any = { display: 'block', width: '100%', padding: '10px 12px', backgroundColor: '#FF002B', color: '#fff', textDecoration: 'none', borderRadius: '30px', textAlign: 'center', fontWeight: '900', fontSize: '15px', boxShadow: '0 3px 10px rgba(255, 0, 43, 0.25)' };
const paymeBtnDisabledStyle: any = { display: 'block', width: '100%', padding: '10px 12px', backgroundColor: '#e0e0e0', color: '#666', borderRadius: '30px', textAlign: 'center', fontWeight: '900', fontSize: '12px', cursor: 'not-allowed' };
const capNoticeStyle: any = { backgroundColor: '#FEF08A', padding: '14px 16px', borderRadius: '16px', marginBottom: '16px', border: '3px solid #CA8A04', textAlign: 'center', width: '95%', maxWidth: '380px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', color: '#000' };
const orderDraftStyle: any = { backgroundColor: '#fff', padding: '15px', width: '95%', maxWidth: '380px', border: '4px solid #77815C', color: '#000' };
const orderHeaderStyle: any = { borderBottom: '2px solid #77815C', paddingBottom: '8px', marginBottom: '10px', textAlign: 'center' };
const orderInfoBoxStyle: any = { fontSize: '12px', marginBottom: '10px', lineHeight: '1.4', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' };
const addressPreviewStyle: any = { fontSize: '11px', backgroundColor: '#fff', padding: '4px', borderRadius: '4px', border: '1px solid #f0f0f0', display: 'block', marginTop: '4px' };
const orderTotalAreaStyle: any = { borderTop: '2px dashed #eee', marginTop: '10px', paddingTop: '8px', textAlign: 'right' };
const quoteAreaStyle: any = { marginTop: '10px', padding: '8px 5px', borderTop: '1px solid #eee', fontSize: '11px', color: '#77815C', fontWeight: 'bold', textAlign: 'center' };
const agreementBoxStyle: any = { width: '95%', maxWidth: '380px', marginTop: '20px', padding: '18px', backgroundColor: '#FFF9E6', borderRadius: '16px', border: '2px solid #FFCC00' };
const igLinkBtnStyle: any = { flex: 1, padding: '10px', borderRadius: '12px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' };
const privacyNoticeStyle: any = { fontSize: '11px', color: '#666', marginBottom: '10px' };
const addonCardStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#FFF5F7', borderRadius: '15px', border: '2px solid #FFD1DC', marginTop: '15px' };

// 🔘 升級：補錢湊數的立體按鈕樣式
const diffBtnStyle: any = { 
  width: '35px', 
  height: '35px', 
  border: '1px solid #D63384', 
  backgroundColor: '#fff', 
  color: '#D63384', 
  borderRadius: '10px', 
  fontWeight: 'bold', 
  cursor: 'pointer' 
};

// COMPONENTS
function PreviewAdd({ count, onAdd, onSub, label, addText, compact }: any) {
  const stop = (e: any) => e.stopPropagation();
  if (!count) {
    return (
      <button
        type="button"
        className="btn-3d"
        onClick={(e) => { stop(e); onAdd(); }}
        style={{
          marginTop: compact ? '4px' : '8px',
          width: '100%',
          padding: compact ? '5px 2px' : '9px 10px',
          borderRadius: '8px',
          border: '1px solid #77815C',
          backgroundColor: '#77815C',
          color: '#fff',
          fontSize: compact ? '11px' : '14px',
          fontWeight: '900',
          cursor: 'pointer',
          lineHeight: 1.2
        }}
      >
        {label ? `${label} 加入` : (addText || '加入')}
      </button>
    );
  }
  return (
    <div onClick={stop} style={{ marginTop: compact ? '4px' : '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', width: '100%' }}>
      <button type="button" className="btn-3d" onClick={onSub} style={{ ...btnStyle, width: compact ? '26px' : '28px', height: compact ? '26px' : '28px', fontSize: '14px', flex: '0 0 auto' }}>-</button>
      <span style={{ fontSize: compact ? '12px' : '15px', fontWeight: '900', color: '#77815C', flex: 1, textAlign: 'center' }}>{label ? `${label} ${count}` : count}</span>
      <button type="button" className="btn-3d" onClick={onAdd} style={{ ...btnStyle, width: compact ? '26px' : '28px', height: compact ? '26px' : '28px', fontSize: '14px', flex: '0 0 auto' }}>+</button>
    </div>
  );
}

function CatalogTitle({ children }: any) {
  return (
    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 900, color: '#111', backgroundColor: '#fff', display: 'inline-block', padding: '6px 12px', borderRadius: '999px', border: '2.5px solid #111', boxShadow: '0 3px 0 #111' }}>
      {children}
    </h3>
  );
}

function ShowcaseCardMini({ img, title, price, actions, countOf, onAdd, onSub }: any) { 
  return ( 
    <div 
      style={{ 
        backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      <img src={img} alt={title} loading="lazy" decoding="async" onClick={() => openPhotoPreview(img, title)} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
      <div style={{ padding: '6px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#77815C', fontWeight: '900' }}>{price}</div>
        {actions?.map((action: any) => (
          <PreviewAdd key={action.key} compact label={action.label} count={countOf(action.key)} onAdd={() => onAdd(action.key)} onSub={() => onSub(action.key)} />
        ))}
      </div>
    </div> 
  ); 
}

function ColorShowcaseMini({ img, title, sub, price, count, onAdd, onSub }: any) {
  return (
    <div 
      style={{
        backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', textAlign: 'center', border: '1px solid #ddd'
      }}
    >
      <img src={img} alt={title} loading="lazy" decoding="async" onClick={() => openPhotoPreview(img, title)} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
      <div style={{ padding: '4px 2px 6px', fontSize: '10px', color: '#333', fontWeight: 'bold' }}>
        {title}
        {price && <span style={{ display: 'block', fontSize: '11px', color: price === '$58' ? '#77815C' : '#B91C1C', fontWeight: '900' }}>{price}</span>}
        {sub && <span style={{ fontSize: '9px', color: '#77815C', display: 'block' }}>({sub})</span>}
        {onAdd && <PreviewAdd compact count={count} onAdd={onAdd} onSub={onSub} />}
      </div>
    </div>
  );
}

function PhotoLightbox({ src, title, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: '#1a1a1a', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px' }}>
        <img src={src} alt={title} style={{ width: '100%', maxHeight: '72vh', objectFit: 'contain', display: 'block', backgroundColor: '#fff', borderRadius: '16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '10px' }}>
          <span style={{ color: '#fff', fontWeight: '900', fontSize: '15px' }}>{title}</span>
          <button type="button" onClick={onClose} style={{ border: 'none', backgroundColor: '#fff', color: '#111', borderRadius: '20px', padding: '8px 14px', fontWeight: '900', cursor: 'pointer' }}>關閉</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, badge, badgeColor, action, children }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#77815C' }}>{title}</h3>
        {action}
        {badge && (
          <span style={{ backgroundColor: badgeColor || '#2E7D32', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ name, count, onAdd, onSub }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{name}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button type="button" onClick={onSub} className="btn-3d" style={btnStyle}>-</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{count}</span>
        <button type="button" onClick={onAdd} className="btn-3d" style={btnStyle}>+</button>
      </div>
    </div>
  );
}

function AddonCoverPicker({ items, tapeCount, coverColors, open, onToggle, onDelta, onReset }: any) {
  const addonQty = Math.max(0, Math.floor(Number(items.coverAddon) || 0));
  if (addonQty <= 0) return null;
  const defaults = defaultCoverColors(items, addonQty);
  const colors = coverColors == null ? defaults : normalizeCoverColors(coverColors, addonQty);
  const isDefault = coverColors == null || sameCoverMap(colors, defaults);
  const assigned = coverSum(colors);
  const unassigned = addonQty - assigned;
  const summary = assigned === 0
    ? '顏色未揀'
    : `${isDefault ? '跟座身：' : ''}${coverColorText(colors, addonQty, false)}`;

  return (
    <div style={{ backgroundColor: '#F4F6F0', borderRadius: '12px', padding: '10px 12px', margin: '0 0 10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: '900' }}>已加購 {addonQty} 隻防塵蓋</div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#3f4a2e', lineHeight: 1.4 }}>{summary}</div>
          {tapeCount > 0 && tapeCount !== addonQty && (
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', lineHeight: 1.4 }}>
              膠紙座有 {tapeCount} 個，蓋有 {addonQty} 隻
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '2px solid #77815C', backgroundColor: open ? '#77815C' : '#fff', color: open ? '#fff' : '#3f4a2e', fontWeight: 900, fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}
        >
          {open ? '收起' : isDefault ? '轉色' : '改顏色'}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: '#fff', fontSize: '12px', fontWeight: '800', color: '#3f4a2e', lineHeight: 1.45 }}>
            {unassigned > 0 ? `未分配 ×${unassigned}，撳加號就用呢隻。` : '撳加號會由數量最多嗰隻色借一隻過嚟。'}
          </div>
          {!isDefault && (
            <button type="button" onClick={onReset} style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #77815C', backgroundColor: '#fff', color: '#3f4a2e', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>
              全部跟座身
            </button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', marginTop: '8px' }}>
            {TAPE_COLORS.map((color) => {
              const count = colors[color.key] || 0;
              const canAdd = unassigned > 0 || TAPE_COLORS.some((other) => other.key !== color.key && (colors[other.key] || 0) > 0);
              return (
                <div key={color.key} style={{ minWidth: 0, paddingBottom: '6px', borderBottom: '1px solid #e3e8d8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color.swatch, border: '1px solid rgba(0,0,0,0.25)', flexShrink: 0 }} />
                    {color.label}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <button type="button" aria-label={`減少${color.label}防塵蓋`} disabled={count <= 0} onClick={() => onDelta(color.key, -1)} className="btn-3d" style={{ ...btnStyle, width: '28px', height: '28px', opacity: count <= 0 ? 0.35 : 1 }}>-</button>
                    <span style={{ minWidth: '16px', textAlign: 'center', fontWeight: '900', fontSize: '14px' }}>{count}</span>
                    <button type="button" aria-label={`增加${color.label}防塵蓋`} disabled={!canAdd} onClick={() => onDelta(color.key, 1)} className="btn-3d" style={{ ...btnStyle, width: '28px', height: '28px', opacity: canAdd ? 1 : 0.35 }}>+</button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Radio({ label, active, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: '20px',
        border: active ? '2px solid #77815C' : '2px solid #ddd',
        backgroundColor: active ? '#77815C' : '#fff',
        color: active ? '#fff' : '#666',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  );
}
