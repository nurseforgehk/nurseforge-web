"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function NurseForgeFinalV25() {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [orderId, setOrderId] = useState(''); 
  const [today, setToday] = useState('');
  const [randomQuote, setRandomQuote] = useState('');

  const quotes = [
    "祝你準時收工！🕒", "見字飲水呀同事！💧", "記得去廁所，人工包埋㗎！🚽", 
    "祝你生意淡薄，越淡好！🛌", "祝你日日返工靚腳靚場！✨", 
    "收工未呢？收工去食返餐好嘅！🍱", "祝你如意吉場，場場清空！🍊", 
    "祝你所有病人都 nil active c/o！😴", "返 night 同病人齊齊 sleep well！💤",
    "今日辛苦晒，NurseForge 撐住你！💪"
  ];

  const initialItems = {
    tapeWhite: 0, tapeGrey: 0, 
    tapeBlack: 0, tapeRed: 0, tapeYellow: 0, tapeOrange: 0, tapePurple: 0, tapeGreen: 0,
    tapePink: 0, tapeDesertYellow: 0, tapeOceanBlue: 0, tapeIceBlue: 0, 
    coverChiikawa: 0, coverUsagi: 0, coverAddon: 0, coverSingle: 0, 
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
  
  const orderSectionRef = useRef<HTMLDivElement>(null);

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


  // ======= ⚙️ 智能防塵蓋提示邏輯 =======

  // 1. 計算所有膠紙座的總數量，以及到底揀咗幾多「種」唔同嘅顏色
  const tapeColorQuantities = [
    items.tapeWhite, items.tapeGrey, items.tapeBlack, items.tapeRed, 
    items.tapeYellow, items.tapeOrange, items.tapePurple, items.tapeGreen, 
    items.tapePink, items.tapeDesertYellow, items.tapeOceanBlue, items.tapeIceBlue
  ];
  
  const totalTapeCount = tapeColorQuantities.reduce((acc, curr) => acc + curr, 0);
  const distinctColorsCount = tapeColorQuantities.filter(qty => qty > 0).length;

  // 2. 計算防塵蓋的總數量
  const totalCoverCount = items.coverChiikawa + items.coverUsagi + items.coverAddon + items.coverSingle;

  // 3. 判斷是否需要彈出溫馨提示：
  // 條件：買咗多過一種色嘅膠紙座 且 防塵蓋同膠紙座總數不相等
  const showCoverRemarkNotice = distinctColorsCount >= 2 && totalCoverCount > 0 && totalCoverCount !== totalTapeCount;

  // ===================================


  // 驗證基本出貨資料及聲明是否都有填好
  const isFormValid = agreed && shipping.name.trim() !== '' && shipping.phone.trim() !== '' && shipping.igName.trim() !== '' && shipping.address.trim() !== '';

  // Calculate Total
  const total = [
    { qty: items.tapeWhite, p: 58 }, { qty: items.tapeGrey, p: 58 },
    { qty: items.tapeBlack + items.tapeRed + items.tapeYellow + items.tapeOrange + items.tapePurple + items.tapeGreen + items.tapePink + items.tapeDesertYellow + items.tapeOceanBlue + items.tapeIceBlue, p: 78 },
    { qty: items.coverChiikawa + items.coverUsagi, p: 30 }, 
    { qty: items.coverAddon, p: 10 }, { qty: items.coverSingle, p: 15 },
    { qty: items.clickerCallbellNormal + items.clickerCallbellFinger, p: 68 }, 
    { qty: items.clickerCallcarNormal + items.clickerCallcarFinger, p: 125 },
    { qty: items.clickerLuckyPink, p: 58 }, { qty: items.clickerLuckyBlue, p: 58 },
    { qty: items.clickerCombo, p: 110 }, { qty: items.clickerShutUp, p: 68 },
    { qty: items.keyringNoWork, p: 28 }, { qty: items.keyringLucky, p: 28 },
    { qty: 1, p: items.addonDiff }
  ].reduce((acc, curr) => acc + (curr.qty * curr.p), 0);

  const isFreeSF = total >= 200;

  const customColors = [
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
    ...customColors.map(c => ({ name: c.n + '膠紙座', qty: (items as any)[`tape${c.k}`], price: 78 })),
    { name: 'Chiikawa防塵蓋', qty: items.coverChiikawa, price: 30 },
    { name: 'Usagi防塵蓋', qty: items.coverUsagi, price: 30 },
    { name: '隨座加購防塵蓋', qty: items.coverAddon, price: 10 },
    { name: '獨立防塵蓋', qty: items.coverSingle, price: 15 },
    { name: '叫人鐘 (正常版本)', qty: items.clickerCallbellNormal, price: 68 },
    { name: '叫人鐘 (舉中指版本)', qty: items.clickerCallbellFinger, price: 68 },
    { name: '叫人鐘收聲先 (正常版本)', qty: items.clickerCallcarNormal, price: 125 },
    { name: '叫人鐘收聲先 (舉中指版本)', qty: items.clickerCallcarFinger, price: 125 },
    { name: '粉紅白吉床', qty: items.clickerLuckyPink, price: 58 },
    { name: '藍白吉床', qty: items.clickerLuckyBlue, price: 58 },
    { name: '吉床套裝 (粉紅+藍)', qty: items.clickerCombo, price: 110 },
    { name: '收聲先', qty: items.clickerShutUp, price: 68 },
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

  const update = (f: string, d: number) => setItems(p => ({ ...p, [f]: Math.max(0, (p as any)[f] + d) }));
  const clearAll = () => { if(confirm("確定要清除所有已選商品？")) { setItems(initialItems); } };

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px 20px 350px 20px', backgroundColor: '#77815C', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
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
      `}</style>

      <button type="button" onClick={() => orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} style={fabStyle}>
        直接帶我去揀商品 🛒
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px', color: '#fff', paddingTop: '60px' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0' }}>NurseForgeHK</h1>
        <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px', opacity: 0.9 }}>by @nursingmeme_hk</p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto 30px auto' }}>
        <div style={announcementStyle}>
          <span style={{ fontSize: '24px' }}>📢</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#856404' }}>店主公告</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.6' }}>
              ✨ <b>全店滿 $200 即享順豐站/智能櫃免運費！</b><br />
              🔥 <b>新貨上架：</b>想感受吓病人亂咁用 Call Bell 嘅快感？🤪 現時推出咗最新嘅 <b>Call Bell Clicker</b> 啦，快啲下單啦！
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>產品預覽 (點擊圖片可放大/縮小)</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
            <ShowcaseCardMini img="/whitetape.jpg" title="白色膠紙座" price="$58" />
            <ShowcaseCardMini img="/greytape.jpg" title="灰色膠紙座" price="$58" />
            <ShowcaseCardMini img="/chi.jpg" title="Chiikawa防塵蓋" price="$30" />
            <ShowcaseCardMini img="/us.jpg" title="Usagi防塵蓋" price="$30" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <a href="https://www.instagram.com/p/DW9hjFeEtjL/" target="_blank" rel="noreferrer" style={igLinkBtnStyle}>🎨 睇客制顏色選項</a>
            <a href="https://www.instagram.com/p/DW3pJ1zkuY4/" target="_blank" rel="noreferrer" style={igLinkBtnStyle}>🛡️ 點解要加防塵蓋？</a>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '15px', marginBottom: '25px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>🎨 3D打印材料顏色預覽 (點擊可放大)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {[
              { img: 'white', name: '白色' }, { img: 'grey', name: '灰色' }, { img: 'black', name: '黑色' },
              { img: 'red', name: '深紅' }, { img: 'warmyellow', name: '暖黃' }, { img: 'orange', name: '橙色' },
              { img: 'purple', name: '紫色' }, { img: 'green', name: '綠色' }, { img: 'pink', name: '櫻花粉' },
              { img: 'usagiyellow', name: '沙漠黃 (Usagi黃)' }, { img: 'seaglue', name: '海洋藍' }, { img: 'iceblue', name: '冰藍' }
            ].map((color, idx) => (
              <ColorShowcaseMini key={idx} img={`/${color.img}.jpg`} title={color.name} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { img: 'pbed', title: '粉紅白吉床', price: '$58' },
            { img: 'bbed', title: '藍白吉床', price: '$58' },
            { img: 'twobed', title: '吉床套裝', price: '$110' },
            { img: 'sick', title: '收聲先', price: '$68' },
            { img: 'callbell', title: '叫人鐘', price: '$68' },
            { img: 'callcar', title: '叫人鐘收聲先', price: '$125' },
            { img: 'cm', title: '不想上班', price: '$28' },
            { img: 'kc', title: '如意吉場', price: '$28' }
          ].map((item, idx) => (
            <ShowcaseCardMini key={idx} img={`/${item.img}.jpg`} title={item.title} price={item.price} />
          ))}
        </div>
      </div>

      <div ref={orderSectionRef} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={formCardStyle}>
          <Section title="📦 第一區：膠紙座系列" badge="可選平郵" badgeColor="#2E7D32">
            <Row name="🤍 白色 White ($58)" count={items.tapeWhite} onAdd={() => update('tapeWhite', 1)} onSub={() => update('tapeWhite', -1)} />
            <Row name="🩶 灰色 Grey ($58)" count={items.tapeGrey} onAdd={() => update('tapeGrey', 1)} onSub={() => update('tapeGrey', -1)} />
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#77815C', marginBottom: '10px' }}>🎨 其他訂造顏色 ($78):</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {customColors.map(c => (
                  <RowMini key={c.k} name={c.n} count={(items as any)[`tape${c.k}`]} onAdd={() => update(`tape${c.k}`, 1)} onSub={() => update(`tape${c.k}`, -1)} />
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', borderTop: '2px dashed #eee', paddingTop: '15px' }}>
              <Row name="🐹 Chiikawa防塵蓋 $30" count={items.coverChiikawa} onAdd={() => update('coverChiikawa', 1)} onSub={() => update('coverChiikawa', -1)} />
              <Row name="🐰 Usagi防塵蓋 $30" count={items.coverUsagi} onAdd={() => update('coverUsagi', 1)} onSub={() => update('coverUsagi', -1)} />
              <Row name="隨座加購防塵蓋 $10" count={items.coverAddon} onAdd={() => update('coverAddon', 1)} onSub={() => update('coverAddon', -1)} />
              <Row name="補買防塵蓋 $15" count={items.coverSingle} onAdd={() => update('coverSingle', 1)} onSub={() => update('coverSingle', -1)} />
              
              {/* 智能精準提示：多過一隻色 且 數量不對等時才會顯示 */}
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
            <Row name="🛎️ 叫人鐘 (正常版本) ($68)" count={items.clickerCallbellNormal} onAdd={() => update('clickerCallbellNormal', 1)} onSub={() => update('clickerCallbellNormal', -1)} />
            <Row name="🛎️ 叫人鐘 (舉中指版本) ($68)" count={items.clickerCallbellFinger} onAdd={() => update('clickerCallbellFinger', 1)} onSub={() => update('clickerCallbellFinger', -1)} />
            <Row name="🚑 叫人鐘收聲先 (正常版本) ($125)" count={items.clickerCallcarNormal} onAdd={() => update('clickerCallcarNormal', 1)} onSub={() => update('clickerCallcarNormal', -1)} />
            <Row name="🚑 叫人鐘收聲先 (舉中指版本) ($125)" count={items.clickerCallcarFinger} onAdd={() => update('clickerCallcarFinger', 1)} onSub={() => update('clickerCallcarFinger', -1)} />
            <Row name="🌸 粉紅白吉床 ($58)" count={items.clickerLuckyPink} onAdd={() => update('clickerLuckyPink', 1)} onSub={() => update('clickerLuckyPink', -1)} />
            <Row name="💎 藍白吉床 ($58)" count={items.clickerLuckyBlue} onAdd={() => update('clickerLuckyBlue', 1)} onSub={() => update('clickerLuckyBlue', -1)} />
            <Row name="✨ 吉床套裝 ($110)" count={items.clickerCombo} onAdd={() => update('clickerCombo', 1)} onSub={() => update('clickerCombo', -1)} />
            <Row name="🤫 收聲先 ($68)" count={items.clickerShutUp} onAdd={() => update('clickerShutUp', -1)} />
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
            
            <input placeholder="備註 (Remarks) (例如：防塵蓋要灰色 / 配邊款座)" style={{...inputStyle, border: showCoverRemarkNotice ? '2px solid #FFCC00' : '2px solid #77815C', backgroundColor: showCoverRemarkNotice ? '#FFF9E6' : '#fff'} as any} value={shipping.remarks} onChange={e => setShipping({...shipping, remarks: e.target.value})} />
            
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
                <button type="button" onClick={() => update('addonDiff', -1)} style={diffBtnStyle}>-1</button>
                <button type="button" onClick={() => update('addonDiff', 1)} style={diffBtnStyle}>+1</button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={capNoticeStyle}>📸 請將以下訂單圖及 PayMe 截圖 send 俾店主</div>
        <div style={orderDraftStyle}>
          <div style={orderHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#77815C' }}>NurseForgeHK 執貨單</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}><span>ID: {orderId}</span><span>DATE: {today}</span></div>
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

      <div style={footerStyle}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          
          <div style={bottomTotalCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>總額：</span>
                 <div style={{ fontSize: '24px', fontWeight: '900', color: '#77815C' }}>HKD ${total}</div>
               </div>
               <button type="button" onClick={clearAll} style={clearBtnStyle}>🗑️ 清空</button>
            </div>
            
            <div style={{ borderTop: '1px dashed #eee', marginTop: '8px', paddingTop: '6px', textAlign: 'center' }}>
              {!isFreeSF ? (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b97a00' }}>
                  💡 再買多 <b style={{ fontSize: '14px', color: '#dc3545' }}>${200 - total}</b> 即可享順豐站/智能櫃免運費！
                </span>
              ) : (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2E7D32' }}>
                  🎉 已滿 $200！已成功享有順豐站/智能櫃免運費優惠！
                </span>
              )}
            </div>
          </div>
          
          <div style={{ transition: 'all 0.3s ease' }}>
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
          
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '10px', fontWeight: 'bold' }}>📸 記得截圖執貨單 send 俾店主呀！</p>
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#aaa', marginTop: '15px' }}>呢個網頁係我自己寫㗎 :D</p>
        </div>
      </div>
    </div>
  );
}

// STYLES
const announcementStyle: any = { backgroundColor: '#FFF9E6', border: '2px solid #FFCC00', borderRadius: '16px', padding: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#000' };
const fabStyle: any = { position: 'absolute', right: '15px', top: '15px', padding: '12px 18px', borderRadius: '20px', backgroundColor: '#fff', color: '#77815C', fontWeight: '900', border: '3px solid #77815C', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', zIndex: 1100, fontSize: '12px' };
const formCardStyle: any = { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', color: '#000' };
const inputStyle: any = { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '15px', marginBottom: '8px' };
const btnStyle: any = { width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#f0f0f0', fontWeight: 'bold' };
const footerStyle: any = { position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: '#fff', padding: '15px 20px 35px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', zIndex: 1000, boxShadow: '0 -5px 25px rgba(0,0,0,0.08)' };
const bottomTotalCardStyle: any = { backgroundColor: '#fff', padding: '12px 15px', borderRadius: '16px', border: '2px solid #77815C', marginBottom: '12px' };
const clearBtnStyle: any = { padding: '6px 12px', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' };
const paymeBtnStyle: any = { display: 'block', width: '100%', padding: '15px', backgroundColor: '#FF002B', color: '#fff', textDecoration: 'none', borderRadius: '40px', textAlign: 'center', fontWeight: '900', fontSize: '18px', boxShadow: '0 4px 15px rgba(255, 0, 43, 0.3)' };
const paymeBtnDisabledStyle: any = { display: 'block', width: '100%', padding: '15px', backgroundColor: '#ccc', color: '#666', borderRadius: '40px', textAlign: 'center', fontWeight: '900', fontSize: '14px', cursor: 'not-allowed' };
const capNoticeStyle: any = { backgroundColor: '#FFED4A', padding: '10px 20px', borderRadius: '10px', marginBottom: '15px', border: '2px solid #000', textAlign: 'center', fontSize: '16px', fontWeight: '900', color: '#000' };
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
const diffBtnStyle: any = { width: '35px', height: '35px', border: '2px solid #D63384', backgroundColor: '#fff', color: '#D63384', borderRadius: '10px', fontWeight: 'bold' };

// COMPONENTS
function ShowcaseCardMini({ img, title, price }: any) { 
  const [isZoomed, setIsZoomed] = useState(false);
  return ( 
    <div 
      onClick={() => setIsZoomed(!isZoomed)}
      style={{ 
        backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s ease', gridColumn: isZoomed ? 'span 4' : 'auto', zIndex: isZoomed ? 10 : 1
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

function ColorShowcaseMini({ img, title }: any) {
  const [isZoomed, setIsZoomed] = useState(false);
  return (
    <div 
      onClick={() => setIsZoomed(!isZoomed)}
      style={{
        backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', textAlign: 'center', border: '1px solid #ddd', cursor: 'pointer', transition: 'all 0.25s ease', gridColumn: isZoomed ? 'span 6' : 'auto', zIndex: isZoomed ? 20 : 1, boxShadow: isZoomed ? '0 8px 25px rgba(0,0,0,0.3)' : 'none'
      } as any}
    >
      <img src={img} style={{ width: '100%', aspectRatio: isZoomed ? 'auto' : '1/1', maxHeight: isZoomed ? '320px' : 'none', objectFit: 'cover' } as any} alt={title} />
      <div style={{ padding: '4px 2px', fontSize: isZoomed ? '14px' : '10px', color: '#333', fontWeight: 'bold' }}>
        {title}
        {isZoomed && <div style={{ fontSize: '11px', color: '#dc3545', fontWeight: 'bold', marginTop: '6px', backgroundColor: '#fff3cd', padding: '2px 4px', borderRadius: '4px', display: 'block' }}>💡 再點擊圖片可縮小 ⬆️</div>}
      </div>
    </div>
  );
}

function Section({ title, badge, badgeColor, children }: any) { return ( <div style={{ marginBottom: '10px' }}><h3 style={{ fontSize: '16px', fontWeight: '900', color: '#77815C', marginBottom: '12px', borderLeft: '5px solid #77815C', paddingLeft: '10px', display: 'flex', alignItems: 'center' } as any}>{title} {badge && <span style={{ fontSize: '10px', backgroundColor: badgeColor, color: '#fff', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' }}>{badge}</span>}</h3>{children}</div> ); }
function Row({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f2f2f2' } as any}><span style={{ fontSize: '14px', color: '#000', fontWeight: '600' }}>{name}</span><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><button type="button" onClick={onSub} style={btnStyle}>−</button><span style={{ fontSize: '16px', fontWeight: '900', minWidth: '18px', textAlign: 'center' }}>{count}</span><button type="button" onClick={onAdd} style={btnStyle}>+</button></div></div> ); }
function RowMini({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #eee' } as any}><span style={{ fontSize: '12px', color: '#000', fontWeight: 'bold' }}>{name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button type="button" onClick={onSub} style={{...btnStyle, width: '22px', height: '22px'}}>−</button><span style={{ fontSize: '14px', fontWeight: '900' }}>{count}</span><button type="button" onClick={onAdd} style={{...btnStyle, width: '22px', height: '22px'}}>+</button></div></div> ); }
function Radio({ label, active, onClick }: any) { return ( <div onClick={onClick} style={{ padding: '8px 12px', borderRadius: '15px', border: `2px solid ${active ? '#77815C' : '#eee'}`, backgroundColor: active ? '#77815C' : '#fff', color: active ? '#fff' : '#000', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' } as any}>{label}</div> ); }