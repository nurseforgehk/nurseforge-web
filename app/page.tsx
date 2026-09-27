"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [orderId, setOrderId] = useState(''); 
  const [today, setToday] = useState('');
  const [randomQuote, setRandomQuote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [showColorPreview, setShowColorPreview] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const quotes = [
    "祝你準時收工！🕒", "見字飲水呀同事！💧", "記得去廁所，人工包埋㗎！🚽", 
    "祝你生意淡薄，越淡越好！🛌", "祝你日日返工靚腳靚場！✨", 
    "收工未呢？收工去食返餐好嘅！🍱", "祝你如意吉場，場場清空！🍊", 
    "祝你所有病人都 nil active c/o！😴", "返 night 同病人齊齊 sleep well！💤",
    "今日辛苦晒，NurseForge 撐住你！💪"
  ];

  const initialItems = {
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
  const [shipping, setShipping] = useState({ 
    name: '', phone: '', igName: '', address: '', method: 'sf_station', remarks: ''
  });

  // 💧 IV Drip Rate 計算器 State
  const [ivVolume, setIvVolume] = useState<number | string>(100);
  const [ivDropFactor, setIvDropFactor] = useState<number | string>(15);
  const [ivTime, setIvTime] = useState<number | string>(30);
  const [ivTimeUnit, setIvTimeUnit] = useState<'mins' | 'hrs'>('mins');
  
  const orderSectionRef = useRef<HTMLDivElement>(null);
  const calcSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setOrderId(Math.floor(Math.random() * 900000000000 + 100000000000).toString());
    const hkDate = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Hong_Kong", year: 'numeric', month: '2-digit', day: '2-digit'
    }).split(',')[0].split('/').reverse().join('-');
    setToday(hkDate);
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

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
    if (isPromoApplied) {
      setShowFireworks(true);
      const timer = setTimeout(() => {
        setShowFireworks(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowFireworks(false);
    }
  }, [isPromoApplied]);

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
  const totalCoverCount = items.coverChiikawa + items.coverUsagi + items.coverHachiware + items.coverMiffyEar + items.coverMiffy + items.coverAddon + items.coverSingle;
  const showCoverRemarkNotice = distinctColorsCount >= 2 && totalCoverCount > 0 && totalCoverCount !== totalTapeCount;

  const isFormValid = agreed && shipping.name.trim() !== '' && shipping.phone.trim() !== '' && shipping.igName.trim() !== '' && shipping.address.trim() !== '';

  const rawTotal = [
    { qty: items.tapeWhite, p: 58 }, { qty: items.tapeGrey, p: 58 },
    { qty: items.tapeAppleGreen, p: 68 },
    { qty: items.tapeMarble + items.tapeBlack + items.tapeRed + items.tapeYellow + items.tapeOrange + items.tapePurple + items.tapeGreen + items.tapePink + items.tapeDesertYellow + items.tapeOceanBlue + items.tapeIceBlue, p: 78 },
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
    { k: 'IceBlue', n: '❄️ 冰藍' }
  ];

  const activeProducts: any[] = [
    { name: '白色膠紙座', qty: items.tapeWhite, price: 58 },
    { name: '灰色膠紙座', qty: items.tapeGrey, price: 58 },
    { name: '九月限定青蘋果綠膠紙座', qty: items.tapeAppleGreen, price: 68 },
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
  ].filter(p => (p.name === '💰 補錢湊數' ? p.price > 0 : p.qty > 0));

  const methodMap: any = { 
    post: "本地平郵 (包郵)", 
    sf_station: isFreeSF ? "順豐站 (免運)" : "順豐站 (到付)", 
    sf_locker: isFreeSF ? "智能櫃 (免運)" : "智能櫃 (到付)",
    sf_store: "順豐合作便利店 (到付)",
    sf_direct: "順豐送上門 (到付)" 
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
  const clearAll = () => { if(confirm("確定要清除所有已選商品？")) { setItems(initialItems); } };

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px 15px 160px 15px', backgroundColor: '#77815C', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
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

      <button type="button" onClick={() => calcSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} style={fabLeftStyle}>
        🔻 IV Drip Rate 計算器
      </button>

      <button type="button" onClick={() => orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} style={fabStyle}>
        直接帶 me 去揀商品 🛒
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
                
                <div>2. 🔥 <b>新貨上架：</b>Call Bell Clicker 鎖匙扣登場，讓你隨時享受亂撳 Call Bell 嘅快感！</div>
                
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

        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>產品預覽 (點擊圖片可放大/縮小)</h2>

        {/* 🍏 九月限定顏色大圖展示 */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          border: '3px solid #38A169',
          marginBottom: '15px',
          color: '#000'
        }}>
          <div style={{
            backgroundColor: '#F0FFF4',
            padding: '10px 14px',
            borderBottom: '2px solid #38A169',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>🍏</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#22543D' }}>
                【九月限定顏色】青蘋果綠膠紙座
              </span>
            </div>
            <span style={{ fontSize: '12px', backgroundColor: '#38A169', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
              $68 / 個
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <img 
              src="/applegreen.jpg" 
              alt="九月限定青蘋果綠膠紙座" 
              style={{
                width: '100%',
                aspectRatio: '3 / 4',
                objectFit: 'cover',
                display: 'block'
              }} 
            />
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#F7FAFC', fontSize: '12.5px', color: '#22543D', fontWeight: 'bold', lineHeight: '1.5' }}>
            ✨ 清爽亮眼青蘋果綠色澤！<b>$68/個</b>（不包防塵蓋，防塵蓋加 <b>+$10</b>）<br />
            <span style={{ color: '#2F855A', fontSize: '11.5px', fontWeight: '800', marginTop: '4px', display: 'block' }}>
              🍏 註：九月限定人氣新色，清新吸睛！
            </span>
          </div>
        </div>

        {/* 白色及灰色膠紙座 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
            <ShowcaseCardMini img="/whitetape.jpg" title="白色膠紙座" price="$58" />
            <ShowcaseCardMini img="/greytape.jpg" title="灰色膠紙座" price="$58" />
        </div>

        {/* 三個特別防塵蓋 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
            <ShowcaseCardMini img="/chi.jpg" title="Chiikawa防塵蓋" price="$30" />
            <ShowcaseCardMini img="/us.jpg" title="Usagi防塵蓋" price="$30" />
            <ShowcaseCardMini img="/ha.jpg" title="Hachiware防塵蓋" price="$30" />
        </div>

        {/* Miffy 特別防塵蓋 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
            <ShowcaseCardMini img="/miffyear.jpg" title="Miffy防塵蓋 (有耳朵版本)" price="$30" />
            <ShowcaseCardMini img="/miffy.jpg" title="近鏡Miffy防塵蓋" price="$30" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <a href="https://www.instagram.com/p/DW9hjFeEtjL/" target="_blank" rel="noreferrer" style={igLinkBtnStyle}>🎨 睇客制顏色選項</a>
            <a href="https://www.instagram.com/p/DW3pJ1zkuY4/" target="_blank" rel="noreferrer" style={igLinkBtnStyle}>🛡️ 點解要加防塵蓋？</a>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <button
            type="button"
            onClick={() => setShowColorPreview(!showColorPreview)}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: '#FFF9E6',
              color: '#744210',
              border: '2.5px solid #D69E2E',
              borderRadius: '16px',
              fontSize: '14.5px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🎨 {showColorPreview ? '隱藏 3D打印材料顏色預覽' : '展開 3D打印材料顏色預覽 (點擊查看所有色卡)'}</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{showColorPreview ? '▲' : '▼'}</span>
          </button>

          {showColorPreview && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '18px', marginTop: '12px', color: '#fff' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px', textAlign: 'center' }}>🎨 3D打印材料顏色預覽 (點擊可放大)</div>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#FFE8A3', marginBottom: '4px' }}>
                  ✨ PLA Matta (啞光物料)
                </div>
                <div style={{ fontSize: '10px', color: '#fff', marginBottom: '8px', opacity: 0.9 }}>
                  💡 註：選用此物料的膠紙座，<b>底部將會配搭白色</b>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { img: 'pink', name: '櫻花粉' },
                    { img: 'seablue', name: '海洋藍' },
                    { img: 'iceblue', name: '冰藍' },
                    { img: 'usagiyellow', name: '沙漠黃 (Usagi黃)' }
                  ].map((color, idx) => (
                    <ColorShowcaseMini key={idx} img={`/${color.img}.jpg`} title={color.name} sub="白底" />
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  🔹 PLA Basic (標準光面物料)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { img: 'white', name: '白色' }, { img: 'grey', name: '灰色' }, 
                    { img: 'black', name: '黑色' }, { img: 'red', name: '深紅' }, 
                    { img: 'warmyellow', name: '暖黃' }, { img: 'orange', name: '橙色' },
                    { img: 'purple', name: '紫色' }, { img: 'green', name: '綠色' }
                  ].map((color, idx) => (
                    <ColorShowcaseMini key={idx} img={`/${color.img}.jpg`} title={color.name} />
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#FFE8A3', marginBottom: '4px' }}>
                  🏛️ PLA 獨立材料
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  <ColorShowcaseMini img="/marble.jpg" title="大理石" sub="獨立材料" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
          {[
            { img: 'pbed', title: '粉紅白吉床', price: '$68' },
            { img: 'bbed', title: '藍白吉床', price: '$68' },
            { img: 'twobed', title: '吉床套裝 (粉紅白x1+藍白x1)', price: '$125' },
            { img: 'cm', title: '收聲先', price: '$78' },
            { img: 'callbell', title: '叫人鐘', price: '$78' },
            { img: 'callcar', title: '叫人鐘收聲先', price: '$145' },
            { img: 'sick', title: '不想上班', price: '$28' },
            { img: 'kc', title: '如意吉場', price: '$28' }
          ].map((item, idx) => (
            <ShowcaseCardMini key={idx} img={`/${item.img}.jpg`} title={item.title} price={item.price} />
          ))}
        </div>

        <div style={{ backgroundColor: '#FFF9E6', border: '2px dashed #FFCC00', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', fontSize: '13px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.5' }}>
          💡 鎖匙扣或者解壓神器都可以獨立訂造顏色，詳情另外諮詢 📩
        </div>
      </div>

      <div ref={orderSectionRef} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={formCardStyle}>
          <Section title="📦 第一區：膠紙座系列" badge="可選平郵" badgeColor="#2E7D32">
            <div style={{ fontSize: '12px', color: '#4A6B22', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#F0F7E6', padding: '8px 12px', borderRadius: '10px', border: '1px solid #D2E7B0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚙️</span>
              <span>所有膠紙座旋轉中軸已統一改用白色 PETG 物料</span>
            </div>
            <Row name="🤍 白色 White ($58)" count={items.tapeWhite} onAdd={() => update('tapeWhite', 1)} onSub={() => update('tapeWhite', -1)} />
            <Row name="🩶 灰色 Grey ($58)" count={items.tapeGrey} onAdd={() => update('tapeGrey', 1)} onSub={() => update('tapeGrey', -1)} />
            
            {/* 🍏 九月限定青蘋果綠膠紙座 */}
            <div style={{ margin: '10px 0', padding: '12px', backgroundColor: '#F0FFF4', border: '2px solid #38A169', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#22543D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🍏 九月限定：青蘋果綠膠紙座 ($68)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#2F855A', fontWeight: 'bold', marginTop: '3px' }}>
                    💡 唔包防塵蓋，防塵蓋加 $10 (於下方選購)<br />
                    ✨ 註：九月限定人氣新色！
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button type="button" onClick={() => update('tapeAppleGreen', -1)} className="btn-3d" style={btnStyle}>-</button>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{items.tapeAppleGreen}</span>
                  <button type="button" onClick={() => update('tapeAppleGreen', 1)} className="btn-3d" style={btnStyle}>+</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#77815C', marginBottom: '10px' }}>🎨 其他訂造顏色 ($78):</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {customColors.map(c => (
                  <RowMini key={c.k} name={c.n} count={(items as any)[`tape${c.k}`]} onAdd={() => update(`tape${c.k}`, 1)} onSub={() => update(`tape${c.k}`, -1)} />
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', borderTop: '2px dashed #eee', paddingTop: '15px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '900', color: '#77815C' }}>🛡️ 標準防塵蓋加購：</p>
              <Row name="隨座加購防塵蓋 $10" count={items.coverAddon} onAdd={() => update('coverAddon', 1)} onSub={() => update('coverAddon', -1)} />
              <Row name="補買防塵蓋 $15" count={items.coverSingle} onAdd={() => update('coverSingle', 1)} onSub={() => update('coverSingle', -1)} />

              <p style={{ margin: '16px 0 6px 0', fontSize: '14px', fontWeight: '900', color: '#77815C' }}>✨ 特別款式防塵蓋：</p>
              <Row name="🐹 Chiikawa防塵蓋 $30" count={items.coverChiikawa} onAdd={() => update('coverChiikawa', 1)} onSub={() => update('coverChiikawa', -1)} />
              <Row name="🐰 Usagi防塵蓋 $30" count={items.coverUsagi} onAdd={() => update('coverUsagi', 1)} onSub={() => update('coverUsagi', -1)} />
              <Row name="🐱 Hachiware防塵蓋 $30" count={items.coverHachiware} onAdd={() => update('coverHachiware', 1)} onSub={() => update('coverHachiware', -1)} />
              <Row name="🐰 Miffy防塵蓋 (有耳朵版本) $30" count={items.coverMiffyEar} onAdd={() => update('coverMiffyEar', 1)} onSub={() => update('coverMiffyEar', -1)} />
              <Row name="🐰 近鏡Miffy防塵蓋 $30" count={items.coverMiffy} onAdd={() => update('coverMiffy', 1)} onSub={() => update('coverMiffy', -1)} />
              
              {showCoverRemarkNotice && (
                <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#FFF9E6', border: '1px dashed #FFCC00', borderRadius: '10px', fontSize: '12px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.5' }}>
                  ⚠️ 溫馨提示：由於你揀咗多款顏色嘅膠紙座，請記得喺下方「第四區」備註欄寫低防塵蓋分別想要咩顏色 / 配邊個座呀，多謝合作 ❤️
                </div>
              )}
            </div>
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🔔 第二區：Clicker 系列" badge="❌ 不設平郵" badgeColor="#dc3545">
            <Row name="🤫 收聲先 ($78)" count={items.clickerShutUp} onAdd={() => update('clickerShutUp', 1)} onSub={() => update('clickerShutUp', -1)} />
            <Row name="🛎️ 叫人鐘 (正常版本) ($78)" count={items.clickerCallbellNormal} onAdd={() => update('clickerCallbellNormal', 1)} onSub={() => update('clickerCallbellNormal', -1)} />
            <Row name="🛎️ 叫人鐘 (舉中指版本) ($78)" count={items.clickerCallbellFinger} onAdd={() => update('clickerCallbellFinger', 1)} onSub={() => update('clickerCallbellFinger', -1)} />
            <Row name="🌸 粉紅白吉床 ($68)" count={items.clickerLuckyPink} onAdd={() => update('clickerLuckyPink', 1)} onSub={() => update('clickerLuckyPink', -1)} />
            <Row name="💎 藍白吉床 ($68)" count={items.clickerLuckyBlue} onAdd={() => update('clickerLuckyBlue', 1)} onSub={() => update('clickerLuckyBlue', -1)} />
            
            <div style={{ margin: '14px 0 10px 0', borderTop: '2px dashed #e2e8f0' }} />

            <Row name="🚑 叫人鐘收聲先 (正常版本) ($145)" count={items.clickerCallcarNormal} onAdd={() => update('clickerCallcarNormal', 1)} onSub={() => update('clickerCallcarNormal', -1)} />
            <Row name="🚑 叫人鐘收聲先 (舉中指版本) ($145)" count={items.clickerCallcarFinger} onAdd={() => update('clickerCallcarFinger', 1)} onSub={() => update('clickerCallcarFinger', -1)} />
            <Row name="✨ 吉床套裝 (含粉紅白吉床x1, 藍白吉床x1) ($125)" count={items.clickerCombo} onAdd={() => update('clickerCombo', 1)} onSub={() => update('clickerCombo', -1)} />
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🎁 第三區：鎖匙扣系列 ($28)" badge="可選平郵" badgeColor="#2E7D32">
            <Row name="🚫 不想上班" count={items.keyringNoWork} onAdd={() => update('keyringNoWork', 1)} onSub={() => update('keyringNoWork', -1)} />
            <Row name="🍊 如意吉場" count={items.keyringLucky} onAdd={() => update('keyringLucky', 1)} onSub={() => update('keyringLucky', -1)} />
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🚚 第四區：配送及個人資訊">
            <p style={privacyNoticeStyle}>🛡️ 呢個網站唔會儲存任何個人資料。</p>
            {hasClicker && <p style={{ color: '#dc3545', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ 由於選購了 Clicker，只能選順豐。</p>}
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="收件人姓名 (必填)" style={inputStyle} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
              <input placeholder="IG 帳號 (必填，方便搵返你)" style={inputStyle} value={shipping.igName} onChange={e => setShipping({...shipping, igName: e.target.value})} />
            </div>
            <input placeholder="聯絡電話 (必填)" style={inputStyle} value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
            
            <textarea 
              placeholder="🏠 請輸入順豐點碼 (如: 852XXX) 及詳細地址（方便店主直接對賬，唔使上網慢慢查返地址呀，麻煩晒 ❤️）" 
              style={{...inputStyle, height: '80px'} as any} 
              value={shipping.address} 
              onChange={e => setShipping({...shipping, address: e.target.value})} 
            />
            
            <input placeholder="備註 (Remarks) (例如：防塵蓋要灰色 / 配邊個座)" style={{...inputStyle, border: showCoverRemarkNotice ? '2px solid #FFCC00' : '2px solid #77815C', backgroundColor: showCoverRemarkNotice ? '#FFF9E6' : '#fff'} as any} value={shipping.remarks} onChange={e => setShipping({...shipping, remarks: e.target.value})} />
            
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#F4F6F0', borderRadius: '12px', border: '1px solid #77815C' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#77815C', display: 'block', marginBottom: '6px' }}>
                🎟️ 優惠碼 (請輸入大楷字母):
              </label>
              <input 
                placeholder="輸入優惠碼" 
                style={{...inputStyle, marginBottom: '0', textTransform: 'uppercase'}} 
                value={promoCode} 
                onChange={e => setPromoCode(e.target.value.toUpperCase())} 
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {!hasClicker && <Radio label="本地平郵 (包郵)" active={shipping.method === 'post'} onClick={() => setShipping({...shipping, method: 'post'})} />}
              <Radio label={isFreeSF ? "順豐站 (免運)" : "順豐站 (到付)"} active={shipping.method === 'sf_station'} onClick={() => setShipping({...shipping, method: 'sf_station'})} />
              <Radio label={isFreeSF ? "智能櫃 (免運)" : "智能櫃 (到付)"} active={shipping.method === 'sf_locker'} onClick={() => setShipping({...shipping, method: 'sf_locker'})} />
              <Radio label="便利店 (到付)" active={shipping.method === 'sf_store'} onClick={() => setShipping({...shipping, method: 'sf_store'})} />
              <Radio label="送上門 (到付)" active={shipping.method === 'sf_direct'} onClick={() => setShipping({...shipping, method: 'sf_direct'})} />
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
            <span>📸</span>
            <span>【重要必睇】點解一定要截圖 send 俾店主？</span>
            <span>📸</span>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #EAB308', textAlign: 'left', fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
            <div style={{ color: '#dc2626', fontWeight: '900', marginBottom: '6px', fontSize: '13.5px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
              <span>⚠️</span>
              <span><b>注意：</b>為保障私隱，本網站為純靜態計算器，<b>絕無儲存任何訂單紀錄及個人資料</b>！</span>
            </div>
            <div style={{ fontWeight: 'bold', color: '#444', marginBottom: '4px' }}>
              所以落單及付款後，請務必完成以下 3 個步驟，店主先可以為你執貨：
            </div>
            <div style={{ paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: '#1f2937' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ backgroundColor: '#FEF08A', color: '#854d0e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>步驟 1</span>
                <span><b>截圖下方「執貨單」全圖</b>（包含地址與所有選購品項）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ backgroundColor: '#FEF08A', color: '#854d0e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>步驟 2</span>
                <span><b>截圖 PayMe 付款成功頁面</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ backgroundColor: '#FEF08A', color: '#854d0e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>步驟 3</span>
                <span>將<b>兩張截圖</b>一併 DM Instagram: <a href="https://instagram.com/nurseforgehk" target="_blank" rel="noreferrer" style={{ color: '#D63384', textDecoration: 'underline' }}>@nurseforgehk</a> 安排出貨 📦</span>
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
             {shipping.remarks && (
               <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#FFF5F7', borderRadius: '4px', borderLeft: '3px solid #D63384', fontSize: '11px', color: '#000' }}>
                 <strong>備註:</strong> {shipping.remarks}
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
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px' }}>
                <span>{p.name} <b style={{ color: '#77815C' }}>x{p.qty}</b></span>
                <span style={{ fontWeight: 'bold' }}>${p.qty * p.price}</span>
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
          <div style={quoteAreaStyle}>✨ {randomQuote}</div>
        </div>

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

      {/* 💧 IV Drip Rate 直式計算器 Section */}
      <div ref={calcSectionRef} style={{ width: '100%', maxWidth: '480px', margin: '35px auto 10px auto' }}>
        <div style={{
          backgroundColor: '#FFF8F0',
          borderRadius: '24px',
          padding: '20px 16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          color: '#000',
          border: '3.5px solid #DD6B20'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #FBD38D', paddingBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>💧</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#DD6B20' }}>
                IV Drip Rate 直式計算器
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#7B341E', fontWeight: 'bold' }}>
                輸液滴速計算與臨床對滴節奏對照
              </p>
            </div>
          </div>

          {/* 直式分數結構 (Fraction Layout) */}
          <div style={{
            backgroundColor: '#FFFAF0',
            border: '2px solid #FBD38D',
            borderRadius: '16px',
            padding: '16px 12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#7B341E', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
              ✏️ 直式算式（直接輸入數字即時計算）：
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {/* 分子 (Numerator): Volume x Drop Factor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9C4221', fontWeight: 'bold', marginBottom: '2px' }}>容量 Volume</span>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #DD6B20', borderRadius: '10px', padding: '2px 6px' }}>
                    <input
                      type="number"
                      value={ivVolume}
                      onChange={e => setIvVolume(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '65px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', border: 'none', outline: 'none' }}
                    />
                    <span style={{ fontSize: '12px', color: '#7B341E', fontWeight: 'bold' }}>mL</span>
                  </div>
                </div>

                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#9C4221', marginTop: '14px' }}>×</span>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9C4221', fontWeight: 'bold', marginBottom: '2px' }}>滴數係數 Drop Factor</span>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #DD6B20', borderRadius: '10px', padding: '2px 6px' }}>
                    <input
                      type="number"
                      value={ivDropFactor}
                      onChange={e => setIvDropFactor(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '55px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', border: 'none', outline: 'none' }}
                    />
                    <span style={{ fontSize: '11px', color: '#7B341E', fontWeight: 'bold' }}>gtt/mL</span>
                  </div>
                </div>
              </div>

              {/* 分數線 (Fraction Divider Line) */}
              <div style={{ width: '85%', maxWidth: '280px', height: '3px', backgroundColor: '#DD6B20', borderRadius: '2px', margin: '4px 0' }} />

              {/* 分母 (Denominator): Time x Unit Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9C4221', fontWeight: 'bold', marginBottom: '2px' }}>時間 Time</span>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '2px solid #DD6B20', borderRadius: '10px', padding: '2px 6px' }}>
                    <input
                      type="number"
                      value={ivTime}
                      onChange={e => setIvTime(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '60px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', border: 'none', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9C4221', fontWeight: 'bold', marginBottom: '2px' }}>單位 Unit</span>
                  <button
                    type="button"
                    onClick={() => setIvTimeUnit(u => u === 'mins' ? 'hrs' : 'mins')}
                    style={{
                      backgroundColor: '#DD6B20',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(221,107,32,0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {ivTimeUnit === 'mins' ? '⏱️ 分鐘 (mins)' : '⏳ 小時 (hrs)'} 🔄
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 計算結果區塊 (Results Display) */}
          <div style={{
            backgroundColor: '#FFEDD5',
            border: '2px solid #F97316',
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#9A3412', fontWeight: 'bold', marginBottom: '8px' }}>
              📊 即時計算結果：
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center'
            }}>
              {/* 1. 標準滴速 */}
              <div style={{
                backgroundColor: '#fff',
                border: '1.5px solid #DD6B20',
                borderRadius: '12px',
                padding: '8px 16px',
                width: '100%',
                maxWidth: '320px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: '12px', color: '#7B341E', fontWeight: 'bold' }}>🎯 標準滴速：</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#C05621', marginLeft: '6px' }}>
                  {gttPerMin}
                </span>
                <span style={{ fontSize: '13px', color: '#C05621', fontWeight: 'bold', marginLeft: '4px' }}>gtt/min</span>
              </div>

              {/* 2. 臨床對滴節奏 */}
              <div style={{
                backgroundColor: '#FEFCBF',
                border: '1.5px solid #D69E2E',
                borderRadius: '12px',
                padding: '8px 16px',
                width: '100%',
                maxWidth: '320px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: '12px', color: '#744210', fontWeight: 'bold' }}>⏱️ 臨床對滴節奏：</span>
                <span style={{ fontSize: '17px', fontWeight: '900', color: '#B7791F', marginLeft: '6px' }}>
                  {rhythm.text}
                </span>
              </div>

              {/* 3. 10 秒速查 */}
              <div style={{
                backgroundColor: '#FFF5EB',
                border: '1.5px solid #F97316',
                borderRadius: '12px',
                padding: '8px 16px',
                width: '100%',
                maxWidth: '320px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: '12px', color: '#9A3412', fontWeight: 'bold' }}>⚡ 10 秒速查：</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#C2410C', marginLeft: '6px' }}>
                  10 秒約走 {dropsIn10Sec} 滴
                </span>
              </div>
            </div>
          </div>

          {/* 底部返回頂部按鈕 */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              backgroundColor: '#DD6B20',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(221,107,32,0.3)',
              textAlign: 'center'
            }}
          >
            🔝 返回網頁最頂 / 查看商品
          </button>
        </div>
      </div>

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
          
          <div>
            {isFormValid ? (
              <a 
                href="https://payme.hsbc/nfhk" 
                target="_blank" 
                rel="noreferrer" 
                className="payme-active-btn"
                style={paymeBtnStyle}
              >
                🌟 立即 PayMe 付款
              </a>
            ) : (
              <div style={paymeBtnDisabledStyle}>
                {!agreed ? "請先剔選上方聲明" : "請填妥姓名/IG/電話/詳細地址"}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', padding: '0 2px' }}>
            <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '900', backgroundColor: '#FEF08A', padding: '2px 6px', borderRadius: '6px', border: '1px solid #EAB308' }}>
              📸 必做：截圖執貨單+PayMe紀錄 DM 店主 (網站無儲存)
            </span>
            <span style={{ fontSize: '9px', color: '#aaa' }}>by @nursingmeme_hk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const announcementStyle: any = { backgroundColor: '#FFF9E6', border: '1.5px solid #FFCC00', borderRadius: '14px', padding: '12px 14px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', color: '#000' };
const fabLeftStyle: any = { position: 'absolute', left: '10px', top: '12px', padding: '10px 12px', borderRadius: '20px', backgroundColor: '#fff', color: '#DD6B20', fontWeight: '900', border: '2.5px solid #DD6B20', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1100, fontSize: '11px', cursor: 'pointer' };
const fabStyle: any = { position: 'absolute', right: '10px', top: '12px', padding: '10px 12px', borderRadius: '20px', backgroundColor: '#fff', color: '#77815C', fontWeight: '900', border: '2.5px solid #77815C', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1100, fontSize: '11px', cursor: 'pointer' };
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
function ShowcaseCardMini({ img, title, price }: any) { 
  const [isZoomed, setIsZoomed] = useState(false);
  return ( 
    <div 
      onClick={() => setIsZoomed(!isZoomed)}
      style={{ 
        backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s ease', gridColumn: isZoomed ? '1 / -1' : 'auto', zIndex: isZoomed ? 10 : 1
      } as any}
    >
      <img src={img} style={{ width: '100%', aspectRatio: isZoomed ? 'auto' : '1/1', maxHeight: isZoomed ? '400px' : 'none', objectFit: 'cover', transition: 'all 0.3s ease' } as any} alt={title} />
      <div style={{ padding: isZoomed ? '12px' : '6px' }}>
        <div style={{ fontSize: isZoomed ? '15px' : '11px', fontWeight: 'bold', color: '#000' }}>{title}</div>
        <div style={{ fontSize: isZoomed ? '16px' : '12px', color: '#77815C', fontWeight: '900' }}>{price}</div>
        {isZoomed && <div style={{ fontSize: '11px', color: '#dc3545', fontWeight: 'bold', marginTop: '6px', backgroundColor: '#fff3cd', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>💡 再點擊圖片可縮小 ⬆️</div>}
      </div>
    </div> 
  ); 
}

function ColorShowcaseMini({ img, title, sub }: any) {
  const [isZoomed, setIsZoomed] = useState(false);
  return (
    <div 
      onClick={() => setIsZoomed(!isZoomed)}
      style={{
        backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', textAlign: 'center', border: '1px solid #ddd', cursor: 'pointer', transition: 'all 0.25s ease', gridColumn: isZoomed ? '1 / -1' : 'auto', zIndex: isZoomed ? 20 : 1, boxShadow: isZoomed ? '0 8px 25px rgba(0,0,0,0.3)' : 'none'
      } as any}
    >
      <img src={img} style={{ width: '100%', aspectRatio: isZoomed ? 'auto' : '1/1', maxHeight: isZoomed ? '320px' : 'none', objectFit: 'cover' } as any} alt={title} />
      <div style={{ padding: '4px 2px', fontSize: isZoomed ? '13px' : '10px', color: '#333', fontWeight: 'bold' }}>
        {title}
        {sub && <span style={{ fontSize: '9px', color: '#77815C', display: 'block' }}>({sub})</span>}
      </div>
    </div>
  );
}

function Section({ title, badge, badgeColor, children }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#77815C' }}>{title}</h3>
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

function RowMini({ name, count, onAdd, onSub }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#fff', padding: '8px', borderRadius: '10px', border: '1px solid #eee' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>{name}</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onSub} className="btn-3d" style={{ ...btnStyle, width: '26px', height: '26px', fontSize: '12px' }}>-</button>
        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{count}</span>
        <button type="button" onClick={onAdd} className="btn-3d" style={{ ...btnStyle, width: '26px', height: '26px', fontSize: '12px' }}>+</button>
      </div>
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
