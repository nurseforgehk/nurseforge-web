"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function NurseForgeFinalV16() {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState(''); 
  const [today, setToday] = useState('');
  const [randomQuote, setRandomQuote] = useState('');

  const quotes = [
    "祝你準時收工！🕒", "見字飲水呀同事！💧", "記得去廁所，人工包埋㗎！🚽", 
    "祝你生意淡薄，越淡越好！🛌", "祝你日日返工靚腳靚場！✨", 
    "收工未呢？收工去食返餐好嘅！🍱", "祝你如意吉場，場場清空！🍊", 
    "祝你所有病人都 nil active c/o！😴", "返 night 同病人齊齊 sleep well！💤",
    "今日辛苦晒，NurseForge 撐住你！💪"
  ];

  const [items, setItems] = useState({
    tapeWhite: 0, tapeGrey: 0, tapeMonthly: 0, 
    tapeBlack: 0, tapeRed: 0, tapeYellow: 0, tapeOrange: 0, tapePurple: 0, tapeGreen: 0,
    tapePink: 0, tapeDesertYellow: 0, 
    coverAddon: 0, coverSingle: 0, keyringNoWork: 0, keyringLucky: 0,
    clickerLuckyPink: 0, clickerLuckyBlue: 0, clickerShutUp: 0, clickerCombo: 0, addonDiff: 0 
  });

  const [shipping, setShipping] = useState({ 
    name: '', phone: '', igName: '', address: '', method: 'sf_station', remarks: ''
  });
  
  const orderSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setOrderId(Math.floor(Math.random() * 900000000000 + 100000000000).toString());
    setToday(new Date().toISOString().split('T')[0]);
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const total = [
    { qty: items.tapeWhite, p: 58 }, { qty: items.tapeGrey, p: 58 }, { qty: items.tapeMonthly, p: 68 },
    { qty: items.tapeBlack + items.tapeRed + items.tapeYellow + items.tapeOrange + items.tapePurple + items.tapeGreen + items.tapePink + items.tapeDesertYellow, p: 78 },
    { qty: items.coverAddon, p: 10 }, { qty: items.coverSingle, p: 15 },
    { qty: items.clickerLuckyPink, p: 58 }, { qty: items.clickerLuckyBlue, p: 58 },
    { qty: items.clickerCombo, p: 110 }, { qty: items.clickerShutUp, p: 68 },
    { qty: items.keyringNoWork, p: 28 }, { qty: items.keyringLucky, p: 28 },
    { qty: 1, p: items.addonDiff }
  ].reduce((acc, curr) => acc + (curr.qty * curr.p), 0);

  const activeProducts = [
    { name: '白色膠紙座', qty: items.tapeWhite, price: 58 },
    { name: '灰色膠紙座', qty: items.tapeGrey, price: 58 },
    { name: '4月限定色 (海洋藍)', qty: items.tapeMonthly, price: 68 },
    { name: '訂造色座 (Custom)', qty: (items.tapeBlack + items.tapeRed + items.tapeYellow + items.tapeOrange + items.tapePurple + items.tapeGreen + items.tapePink + items.tapeDesertYellow), price: 78 },
    { name: '隨座加購防塵蓋', qty: items.coverAddon, price: 10 },
    { name: '獨立防塵蓋', qty: items.coverSingle, price: 15 },
    { name: '粉紅白吉床', qty: items.clickerLuckyPink, price: 58 },
    { name: '藍白吉床', qty: items.clickerLuckyBlue, price: 58 },
    { name: '吉床套裝 (粉紅+藍)', qty: items.clickerCombo, price: 110 },
    { name: '收聲先', qty: items.clickerShutUp, price: 68 },
    { name: '不想上班鎖匙扣', qty: items.keyringNoWork, price: 28 },
    { name: '如意吉場鎖匙扣', qty: items.keyringLucky, price: 28 },
    { name: '💰 補錢湊數', qty: 1, price: items.addonDiff, isAddon: true }
  ].filter(p => p.qty > 0 && (p.isAddon ? p.price > 0 : true));

  const isFreeSF = total >= 120;
  const methodMap: any = { post: "本地平郵", sf_station: isFreeSF ? "順豐站 (免運)" : "順豐站到付", sf_locker: isFreeSF ? "智能櫃 (免運)" : "順豐站到付", sf_direct: "送上門 (到付)" };

  const update = (f: string, d: number) => setItems(p => ({ ...p, [f]: Math.max(0, (p as any)[f] + d) }));

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px 20px 450px 20px', backgroundColor: '#77815C', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
      <button onClick={() => orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} style={fabStyle}>
        我已經諗到買咩，<br/>直接帶我去揀商品 🛒
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px', color: '#fff', paddingTop: '60px' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0' }}>NurseForgeHK</h1>
        <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px', opacity: 0.9 }}>by @nursingmeme_hk</p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto 30px auto' }}>
        {/* 膠紙座陳列連連結按鈕 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <ShowcaseCardMini img="/whitetape.jpg" title="白色膠紙座" price="$58" />
            <ShowcaseCardMini img="/greytape.jpg" title="灰色膠紙座" price="$58" />
        </div>
        
        {/* 新增：兩個打橫的 IG 連結按鈕 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
            <a href="https://www.instagram.com/p/DW9hjFeEtjL/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==" target="_blank" style={igLinkBtnStyle}>🎨 睇顏色訂造效果圖</a>
            <a href="https://www.instagram.com/p/DW3pJ1zkuY4/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==" target="_blank" style={igLinkBtnStyle}>🛡️ 點解要加防塵蓋？</a>
        </div>

        {/* 其他產品陳列 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {['pbed', 'bbed', 'twobed', 'cm', 'sick', 'kc'].map((img, idx) => (
            <ShowcaseCardMini key={idx} img={`/${img}.jpg`} title={["粉紅白吉床", "藍白吉床", "吉床套裝", "收聲先", "不想上班", "如意吉場"][idx]} price={["$58","$58","$110","$68","$28","$28"][idx]} />
          ))}
        </div>
      </div>

      {/* 填表區 */}
      <div ref={orderSectionRef} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={formCardStyle}>
          <Section title="📦 第一區：膠紙座系列">
            <Row name="🤍 白色 White ($58)" count={items.tapeWhite} onAdd={() => update('tapeWhite', 1)} onSub={() => update('tapeWhite', -1)} />
            <Row name="🩶 灰色 Grey ($58)" count={items.tapeGrey} onAdd={() => update('tapeGrey', 1)} onSub={() => update('tapeGrey', -1)} />
            <div style={specialRowStyle}>
               <div><span style={specialTagStyle}>APRIL SPECIAL</span><span style={{ fontSize: '14px', fontWeight: '900' }}>🌊 4月限定色：海洋藍 ($68)</span></div>
               <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                 <button onClick={() => update('tapeMonthly', -1)} style={btnStyle}>−</button>
                 <span style={{ fontSize: '18px', fontWeight: '900' }}>{items.tapeMonthly}</span>
                 <button onClick={() => update('tapeMonthly', 1)} style={btnStyle}>+</button>
               </div>
            </div>
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#77815C', marginBottom: '10px' }}>🎨 其他訂造顏色 ($78):</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[{k:'Black',n:'🖤 黑色'},{k:'Red',n:'❤️ 深紅'},{k:'Yellow',n:'💛 暖黃'},{k:'Orange',n:'🧡 橙色'},{k:'Purple',n:'💜 紫色'},{k:'Green',n:'💚 綠色'},{k:'Pink',n:'🌸 櫻花粉'},{k:'DesertYellow',n:'🏜️ 沙漠黃'}].map(c => (
                  <RowMini key={c.k} name={c.n} count={(items as any)[`tape${c.k}`]} onAdd={() => update(`tape${c.k}`, 1)} onSub={() => update(`tape${c.k}`, -1)} />
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', borderTop: '2px dashed #eee', paddingTop: '15px' }}>
              <Row name="隨座加購防塵蓋 $10" count={items.coverAddon} onAdd={() => update('coverAddon', 1)} onSub={() => update('coverAddon', -1)} />
              <Row name="補買防塵蓋 $15" count={items.coverSingle} onAdd={() => update('coverSingle', 1)} onSub={() => update('coverSingle', -1)} />
            </div>
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🔔 第二區：Clicker 系列">
            <Row name="🌸 粉紅白吉床 ($58)" count={items.clickerLuckyPink} onAdd={() => update('clickerLuckyPink', 1)} onSub={() => update('clickerLuckyPink', -1)} />
            <Row name="💎 藍白吉床 ($58)" count={items.clickerLuckyBlue} onAdd={() => update('clickerLuckyBlue', 1)} onSub={() => update('clickerLuckyBlue', -1)} />
            <Row name="✨ 吉床套裝 (粉紅+藍) ($110)" count={items.clickerCombo} onAdd={() => update('clickerCombo', 1)} onSub={() => update('clickerCombo', -1)} />
            <Row name="🤫 收聲先 ($68)" count={items.clickerShutUp} onAdd={() => update('clickerShutUp', 1)} onSub={() => update('clickerShutUp', -1)} />
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🎁 第三區：鎖匙扣系列 ($28)">
            <Row name="🚫 不想上班" count={items.keyringNoWork} onAdd={() => update('keyringNoWork', 1)} onSub={() => update('keyringNoWork', -1)} />
            <Row name="🍊 如意吉場" count={items.keyringLucky} onAdd={() => update('keyringLucky', 1)} onSub={() => update('keyringLucky', -1)} />
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🚚 第四區：配送及個人資訊">
            <p style={privacyNoticeStyle}>🛡️ <b>隱私聲明：</b>呢個網站唔會儲存任何個人資料。</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="收件人姓名" style={inputStyle} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
              <input placeholder="IG 帳號" style={inputStyle} value={shipping.igName} onChange={e => setShipping({...shipping, igName: e.target.value})} />
            </div>
            <input placeholder="聯絡電話號碼" style={inputStyle} value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
            <textarea placeholder="詳細收件地址 / 順豐代碼" style={{...inputStyle, height: '80px'} as any} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
            <input placeholder="備註事項 (Remarks)" style={{...inputStyle, border: '2px solid #77815C'} as any} value={shipping.remarks} onChange={e => setShipping({...shipping, remarks: e.target.value})} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              <Radio label="本地平郵" active={shipping.method === 'post'} onClick={() => setShipping({...shipping, method: 'post'})} />
              <Radio label={isFreeSF ? "順豐站 (免運)" : "順豐站到付"} active={shipping.method === 'sf_station'} onClick={() => setShipping({...shipping, method: 'sf_station'})} />
              <Radio label={isFreeSF ? "智能櫃 (免運)" : "智能櫃到付"} active={shipping.method === 'sf_locker'} onClick={() => setShipping({...shipping, method: 'sf_locker'})} />
              <Radio label="送上門 (到付)" active={shipping.method === 'sf_direct'} onClick={() => setShipping({...shipping, method: 'sf_direct'})} />
            </div>
            <div style={addonCardStyle}>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#D63384' }}>💰 補錢湊數：${items.addonDiff}</span>
              <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => update('addonDiff', -1)} style={diffBtnStyle}>-1</button><button onClick={() => update('addonDiff', 1)} style={diffBtnStyle}>+1</button></div>
            </div>
          </Section>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px' }}>
        <div style={capNoticeStyle}>📸 請截圖 (Screenshot)</div>
        <div style={orderDraftStyle}>
          <div style={orderHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#77815C' }}>NurseForgeHK</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}><span>ID: {orderId}</span><span>DATE: {today}</span></div>
          </div>
          <div style={orderInfoBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '4px' }}>
               <span><strong>IG:</strong> @{shipping.igName || '---'}</span><span><strong>Tel:</strong> {shipping.phone || '---'}</span>
            </div>
            <p><strong>Ship:</strong> {methodMap[shipping.method]}</p>
            <p style={addressPreviewStyle}><strong>Addr:</strong> {shipping.address || '未填寫'}</p>
            {shipping.remarks && <p style={{ color: '#D63384', fontSize: '11px', marginTop: '2px' }}><strong>Rem:</strong> {shipping.remarks}</p>}
          </div>
          <div style={{ minHeight: '40px' }}>
            {activeProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px' }}><span>{p.name} <b style={{ color: '#77815C' }}>x{p.qty}</b></span><span style={{ fontWeight: 'bold' }}>${p.qty * p.price}</span></div>
            ))}
          </div>
          <div style={orderTotalAreaStyle}><div style={{ fontSize: '24px', fontWeight: '900', color: '#77815C' }}>Total: HKD ${total}</div></div>
          <div style={quoteAreaStyle}>✨ {randomQuote}</div>
        </div>
        <div style={agreementBoxStyle}>
           <label style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
             <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} style={{ width: '20px', height: '20px' }} />
             <div style={{ fontSize: '12px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.4' }}>
               <p>✅ 資訊正確。✅ 3D 打印不設退換。✅ 平郵寄失自負。</p>
             </div>
           </label>
        </div>
      </div>

      <div style={footerStyle}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
            <button onClick={() => { if(!shipping.igName) return alert("填IG先！"); navigator.clipboard.writeText(`Order: ${shipping.igName}`); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={secondaryBtnStyle}>{copied ? "✅ 已複製" : "📋 複製 IG 名"}</button>
            <a href="https://payme.hsbc/nfhk" target="_blank" style={paymeBtnStyle}>立即 PayMe</a>
          </div>
        </div>
        <a href="https://www.instagram.com/nurseforgehk/" target="_blank" style={instagramBtnStyle(agreed)}>
          {agreed ? "去 IG 搵店主落單" : "請先剔選確認方格"}
        </a>
      </div>
    </div>
  );
}

// 樣式表
const igLinkBtnStyle: any = {
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    minWidth: '160px'
};

const fabStyle: any = { position: 'absolute', right: '15px', top: '15px', padding: '12px 18px', borderRadius: '20px', backgroundColor: '#fff', color: '#77815C', fontWeight: '900', border: '3px solid #77815C', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', zIndex: 1100, fontSize: '12px', cursor: 'pointer', textAlign: 'center', transform: 'rotate(-2deg)', transition: 'all 0.2s' };
const formCardStyle: any = { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', color: '#000' };
const orderDraftStyle: any = { backgroundColor: '#fff', padding: '15px', width: '95%', maxWidth: '380px', border: '4px solid #77815C', color: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const orderHeaderStyle: any = { borderBottom: '2px solid #77815C', paddingBottom: '8px', marginBottom: '10px', textAlign: 'center' };
const orderInfoBoxStyle: any = { fontSize: '12px', marginBottom: '10px', lineHeight: '1.4', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' };
const orderTotalAreaStyle: any = { borderTop: '2px dashed #eee', marginTop: '10px', paddingTop: '8px', textAlign: 'right' };
const quoteAreaStyle: any = { marginTop: '10px', padding: '8px 5px', borderTop: '1px solid #eee', fontSize: '11px', color: '#77815C', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center' };
const agreementBoxStyle: any = { width: '95%', maxWidth: '380px', marginTop: '15px', padding: '10px', backgroundColor: '#FFF9E6', borderRadius: '12px', border: '1px solid #FFCC00' };
const footerStyle: any = { position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: '#fff', padding: '10px 20px 25px 20px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', zIndex: 1000 };
const instagramBtnStyle = (agreed: boolean): any => ({ width: '100%', maxWidth: '480px', padding: '15px', color: '#fff', border: 'none', borderRadius: '40px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', textAlign: 'center', background: agreed ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : '#ccc', opacity: agreed ? 1 : 0.7, pointerEvents: agreed ? 'auto' : 'none', boxShadow: agreed ? '0 4px 15px rgba(204, 35, 102, 0.4)' : 'none' });
const inputStyle: any = { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '15px', marginBottom: '8px', color: '#000' };
const btnStyle: any = { width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#f0f0f0', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const secondaryBtnStyle: any = { flex: 1, padding: '12px', backgroundColor: '#fff', color: '#77815C', border: '2px solid #77815C', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' };
const paymeBtnStyle: any = { flex: 1, padding: '12px', backgroundColor: '#FF002B', color: '#fff', textDecoration: 'none', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' };
const specialRowStyle: any = { margin: '15px 0', padding: '15px', backgroundColor: '#E0F2F1', borderRadius: '15px', border: '2px solid #00897B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const specialTagStyle: any = { fontSize: '11px', fontWeight: 'bold', color: '#00897B', display: 'block' };
const privacyNoticeStyle: any = { fontSize: '11px', color: '#666', marginBottom: '10px' };
const capNoticeStyle: any = { backgroundColor: '#FFED4A', padding: '10px 20px', borderRadius: '10px', marginBottom: '15px', border: '2px solid #000', textAlign: 'center', fontSize: '16px', fontWeight: '900', color: '#000' };
const addressPreviewStyle: any = { fontSize: '11px', backgroundColor: '#fff', padding: '4px', borderRadius: '4px', border: '1px solid #f0f0f0', display: 'inline-block' };
const addonCardStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#FFF5F7', borderRadius: '15px', border: '2px solid #FFD1DC', marginTop: '15px' };
const diffBtnStyle: any = { width: '35px', height: '35px', border: '2px solid #D63384', backgroundColor: '#fff', color: '#D63384', borderRadius: '10px', fontWeight: 'bold' };

function ShowcaseCardMini({ img, title, price }: any) { return ( <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } as any}><img src={img} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' } as any} alt={title} /><div style={{ padding: '8px' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}>{title}</div><div style={{ fontSize: '14px', color: '#77815C', fontWeight: '900' }}>{price}</div></div></div> ); }
function Section({ title, children }: any) { return ( <div style={{ marginBottom: '10px' }}><h3 style={{ fontSize: '16px', fontWeight: '900', color: '#77815C', marginBottom: '12px', borderLeft: '5px solid #77815C', paddingLeft: '10px' } as any}>{title}</h3>{children}</div> ); }
function Row({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f2f2f2' } as any}><span style={{ fontSize: '14px', color: '#000', fontWeight: '600' }}>{name}</span><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><button onClick={onSub} style={btnStyle}>−</button><span style={{ fontSize: '16px', fontWeight: '900', minWidth: '18px', textAlign: 'center' }}>{count}</span><button onClick={onAdd} style={btnStyle}>+</button></div></div> ); }
function RowMini({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #eee' } as any}><span style={{ fontSize: '12px', color: '#000', fontWeight: 'bold' }}>{name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button onClick={onSub} style={{...btnStyle, width: '22px', height: '22px'}}>−</button><span style={{ fontSize: '14px', fontWeight: '900' }}>{count}</span><button onClick={onAdd} style={{...btnStyle, width: '22px', height: '22px'}}>+</button></div></div> ); }
function Radio({ label, active, onClick }: any) { return ( <div onClick={onClick} style={{ padding: '8px 12px', borderRadius: '15px', border: `2px solid ${active ? '#77815C' : '#eee'}`, backgroundColor: active ? '#77815C' : '#fff', color: active ? '#fff' : '#000', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' } as any}>{label}</div> ); }