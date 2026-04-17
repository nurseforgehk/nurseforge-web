"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function NurseForgeFinal() {
  const [mounted, setMounted] = useState(false);
  const [h2c, setH2c] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState(''); 
  const [today, setToday] = useState('');

  const [items, setItems] = useState<any>({
    tapeWhite: 0, tapeGrey: 0, tapeMonthly: 0, 
    tapeBlack: 0, tapeRed: 0, tapeYellow: 0, tapeOrange: 0, tapePurple: 0, tapeGreen: 0,
    tapePink: 0, tapeDesertYellow: 0, 
    coverAddon: 0, coverSingle: 0, keyringNoWork: 0, keyringLucky: 0,
    clickerLuckyPink: 0, clickerLuckyBlue: 0, clickerShutUp: 0, clickerCombo: 0, addonDiff: 0 
  });

  const [shipping, setShipping] = useState<any>({ 
    name: '', phone: '', igName: '', address: '', method: 'sf_station', remarks: ''
  });
  
  const orderRef = useRef(null);
  const orderSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    import('html2canvas').then(mod => setH2c(() => mod.default));
    const randomDigits = Math.floor(Math.random() * 900000000000) + 100000000000;
    setOrderId(randomDigits.toString());
    const date = new Date();
    setToday(date.toISOString().split('T')[0]);
  }, []);

  const customTapeQty = items.tapeBlack + items.tapeRed + items.tapeYellow + items.tapeOrange + 
                        items.tapePurple + items.tapeGreen + items.tapePink + items.tapeDesertYellow;

  const activeProducts = [
    { name: '白色膠紙座', qty: items.tapeWhite, price: 58 },
    { name: '灰色膠紙座', qty: items.tapeGrey, price: 58 },
    { name: '4月限定色 (海洋藍)', qty: items.tapeMonthly, price: 68 },
    { name: '訂造色座 (Custom)', qty: customTapeQty, price: 78 },
    { name: '加購防塵蓋 (隨座)', qty: items.coverAddon, price: 10 },
    { name: '獨立防塵蓋 (補買)', qty: items.coverSingle, price: 15 },
    { name: '粉紅白吉床', qty: items.clickerLuckyPink, price: 58 },
    { name: '藍白吉床', qty: items.clickerLuckyBlue, price: 58 },
    { name: '粉紅藍吉床套裝', qty: items.clickerCombo, price: 110 },
    { name: '收聲先', qty: items.clickerShutUp, price: 68 },
    { name: '不想上班鎖匙扣', qty: items.keyringNoWork, price: 28 },
    { name: '如意吉場鎖匙扣', qty: items.keyringLucky, price: 28 },
    { name: '💰 補錢湊數', qty: 1, price: items.addonDiff, isAddon: true }
  ].filter(p => p.qty > 0 && (p.isAddon ? p.price > 0 : true));

  const total = activeProducts.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  const isFreeSF = total >= 120;
  const hasClicker = items.clickerLuckyPink > 0 || items.clickerLuckyBlue > 0 || items.clickerShutUp > 0 || items.clickerCombo > 0;
  
  const methodMap: any = {
    post: "本地平郵",
    sf_station: isFreeSF ? "順豐站 (免運)" : "順豐站到付",
    sf_locker: isFreeSF ? "智能櫃 (免運)" : "順豐站到付",
    sf_direct: "送上門 (到付)"
  };

  const scrollToOrder = () => orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  const update = (f: string, d: number) => setItems((p: any) => ({ ...p, [f]: Math.max(0, p[f] + d) }));

  const download = async () => {
    if (!agreed) return;
    if (orderRef.current && h2c) {
      const canvas = await h2c(orderRef.current, { backgroundColor: "#ffffff", scale: 3 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = `Order_${orderId}.png`;
      link.click();
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px 20px 350px 20px', backgroundColor: '#77815C', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <button onClick={scrollToOrder} style={fabStyle}>🛒</button>
      <div style={{ textAlign: 'center', marginBottom: '30px', color: '#fff' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0' }}>NurseForgeHK</h1>
        <p style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>由護士鍛造，為醫護而生</p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto 30px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <ShowcaseCardMini img="/whitetape.jpg" title="白色膠紙座" price="$58" />
        <ShowcaseCardMini img="/greytape.jpg" title="灰色膠紙座" price="$58" />
        <ShowcaseCardMini img="/pbed.jpg" title="粉紅白吉床" price="$58" />
        <ShowcaseCardMini img="/bbed.jpg" title="藍白吉床" price="$58" />
      </div>

      <div ref={orderSectionRef} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={formCardStyle}>
          <Section title="📦 第一區：膠紙座系列">
            <Row name="🤍 白色 White ($58)" count={items.tapeWhite} onAdd={() => update('tapeWhite', 1)} onSub={() => update('tapeWhite', -1)} />
            <Row name="🩶 灰色 Grey ($58)" count={items.tapeGrey} onAdd={() => update('tapeGrey', 1)} onSub={() => update('tapeGrey', -1)} />
            <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#E0F2F1', borderRadius: '15px', border: '2px solid #00897B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00897B', display: 'block' }}>APRIL SPECIAL</span><span style={{ fontSize: '14px', color: '#000', fontWeight: '900' }}>🌊 海洋藍 ($68)</span></div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><button onClick={() => update('tapeMonthly', -1)} style={btnStyle}>−</button><span style={{ fontSize: '18px', fontWeight: '900' }}>{items.tapeMonthly}</span><button onClick={() => update('tapeMonthly', 1)} style={btnStyle}>+</button></div>
              </div>
            </div>
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🚚 配送及資訊">
            <input placeholder="收件人姓名" style={inputStyle} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
            <input placeholder="IG 帳號" style={inputStyle} value={shipping.igName} onChange={e => setShipping({...shipping, igName: e.target.value})} />
            <input placeholder="電話" style={inputStyle} value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
            <textarea placeholder="地址" style={{...inputStyle, height: '80px'}} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              <Radio label={isFreeSF ? "順豐 (免運)" : "順豐到付"} active={shipping.method === 'sf_station'} onClick={() => setShipping({...shipping, method: 'sf_station'})} />
              <Radio label="送上門" active={shipping.method === 'sf_direct'} onClick={() => setShipping({...shipping, method: 'sf_direct'})} />
            </div>
          </Section>
        </div>
      </div>

      <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px' }}>
        <div ref={orderRef} style={orderDraftStyle}>
          <div style={orderHeaderStyle}><h2>NurseForgeHK</h2></div>
          <div style={orderInfoBoxStyle}>
            <p><strong>IG:</strong> @{shipping.igName || '---'}</p>
            <p><strong>Method:</strong> {methodMap[shipping.method]}</p>
          </div>
          {activeProducts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{p.name} x{p.qty}</span><span>${p.qty * p.price}</span>
            </div>
          ))}
          <div style={orderTotalAreaStyle}><h3>Total: ${total}</h3></div>
        </div>
        <div style={agreementBoxStyle}>
          <label style={{ display: 'flex', gap: '10px' }}>
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <span>我已核對資料無誤。</span>
          </label>
        </div>
      </div>

      <div style={footerStyle}>
        <button onClick={download} disabled={!agreed} style={{ ...primaryBtnStyle, backgroundColor: agreed ? '#77815C' : '#ccc' }}>下載執貨單並 DM 我</button>
      </div>
    </div>
  );
}

// 保持與之前一致的樣式對象...
const fabStyle:any = { position: 'fixed', right: '20px', bottom: '120px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 999, fontSize: '28px', cursor: 'pointer' };
const formCardStyle:any = { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', color: '#000' };
const orderDraftStyle:any = { backgroundColor: '#fff', padding: '30px', width: '100%', maxWidth: '420px', border: '5px solid #77815C', color: '#000' };
const orderHeaderStyle:any = { borderBottom: '3px solid #77815C', paddingBottom: '12px', marginBottom: '15px', textAlign: 'center' };
const orderInfoBoxStyle:any = { fontSize: '14px', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px' };
const orderTotalAreaStyle:any = { borderTop: '3px dashed #eee', marginTop: '15px', paddingTop: '15px', textAlign: 'right' };
const agreementBoxStyle:any = { width: '100%', maxWidth: '420px', marginTop: '20px', padding: '15px', backgroundColor: '#FFF9E6', borderRadius: '12px' };
const footerStyle:any = { position: 'fixed', bottom: '0', width: '100%', left: '0', backgroundColor: '#fff', padding: '20px', borderTop: '1px solid #eee', textAlign: 'center', zIndex: 1000 };
const inputStyle:any = { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '15px', marginBottom: '8px', color: '#000' };
const btnStyle:any = { width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#f0f0f0', fontWeight: 'bold' };
const primaryBtnStyle:any = { width: '100%', maxWidth: '480px', padding: '18px', color: '#fff', border: 'none', borderRadius: '40px', fontSize: '18px', fontWeight: 'bold' };

function ShowcaseCardMini({ img, title, price }: any) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', textAlign: 'center', border: '1px solid #eee' }}>
      <img src={img} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} alt={title} />
      <div style={{ padding: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000' }}>{title}</div>
        <div style={{ fontSize: '16px', color: '#77815C', fontWeight: '900' }}>{price}</div>
      </div>
    </div>
  );
}
function Section({ title, children }: any) { return ( <div style={{ marginBottom: '15px' }}><h3 style={{ fontSize: '18px', fontWeight: '900', color: '#77815C', marginBottom: '15px', borderLeft: '6px solid #77815C', paddingLeft: '12px' }}>{title}</h3>{children}</div> ); }
function Row({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f2f2f2' }}><span style={{ fontSize: '15px', color: '#000', fontWeight: '600' }}>{name}</span><div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><button onClick={onSub} style={btnStyle}>−</button><span style={{ fontSize: '18px', fontWeight: '900' }}>{count}</span><button onClick={onAdd} style={btnStyle}>+</button></div></div> ); }
function Radio({ label, active, onClick }: any) { return ( <div onClick={onClick} style={{ padding: '10px 15px', borderRadius: '20px', border: `2px solid ${active ? '#77815C' : '#eee'}`, backgroundColor: active ? '#77815C' : '#fff', color: active ? '#fff' : '#000', fontSize: '13px', cursor: 'pointer' }}>{label}</div> ); }