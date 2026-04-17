"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function NurseForgeFinalV8_1() {
  const [mounted, setMounted] = useState(false);
  const [h2c, setH2c] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState(''); 
  const [today, setToday] = useState('');

  const [items, setItems] = useState({
    tapeWhite: 0, tapeGrey: 0, 
    tapeMonthly: 0, 
    tapeBlack: 0, tapeRed: 0, tapeYellow: 0, tapeOrange: 0, tapePurple: 0, tapeGreen: 0,
    tapePink: 0, tapeDesertYellow: 0, 
    coverAddon: 0, coverSingle: 0, keyringNoWork: 0, keyringLucky: 0,
    clickerLuckyPink: 0, clickerLuckyBlue: 0, clickerShutUp: 0, clickerCombo: 0, addonDiff: 0 
  });

  const [shipping, setShipping] = useState({ 
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
  const update = (f: string, d: number) => setItems(p => ({ ...p, [f]: Math.max(0, (p as any)[f] + d) }));

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
        <ShowcaseCardMini img="/twobed.jpg" title="吉床套裝" price="$110" />
        <ShowcaseCardMini img="/cm.jpg" title="收聲先" price="$68" />
        <ShowcaseCardMini img="/sick.jpg" title="不想上班" price="$28" />
        <ShowcaseCardMini img="/kc.jpg" title="如意吉場" price="$28" />
      </div>

      <div ref={orderSectionRef} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div style={formCardStyle}>
          <Section title="📦 第一區：膠紙座系列">
            <Row name="🤍 白色 White ($58)" count={items.tapeWhite} onAdd={() => update('tapeWhite', 1)} onSub={() => update('tapeWhite', -1)} />
            <Row name="🩶 灰色 Grey ($58)" count={items.tapeGrey} onAdd={() => update('tapeGrey', 1)} onSub={() => update('tapeGrey', -1)} />
            
            <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#E0F2F1', borderRadius: '15px', border: '2px solid #00897B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00897B', display: 'block', letterSpacing: '1px' }}>APRIL SPECIAL</span>
                  <span style={{ fontSize: '14px', color: '#000', fontWeight: '900' }}>🌊 4月限定色：海洋藍 ($68)</span>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button onClick={() => update('tapeMonthly', -1)} style={btnStyle}>−</button>
                  <span style={{ fontSize: '18px', fontWeight: '900' }}>{items.tapeMonthly}</span>
                  <button onClick={() => update('tapeMonthly', 1)} style={btnStyle}>+</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#77815C', marginBottom: '10px' }}>🎨 其他訂造顏色 ($78):</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'Black', name: '🖤 黑色' },
                  { key: 'Red', name: '❤️ 深紅' },
                  { key: 'Yellow', name: '💛 暖黃' },
                  { key: 'Orange', name: '🧡 橙色' },
                  { key: 'Purple', name: '💜 紫色' },
                  { key: 'Green', name: '💚 綠色' },
                  { key: 'Pink', name: '🌸 櫻花粉' },
                  { key: 'DesertYellow', name: '🏜️ 沙漠黃' }
                ].map(col => (
                  <RowMini key={col.key} name={col.name} 
                  count={(items as any)[`tape${col.key}`]} onAdd={() => update(`tape${col.key}`, 1)} onSub={() => update(`tape${col.key}`, -1)} />
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '2px dashed #eee', paddingTop: '15px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#77815C', marginBottom: '8px' }}>🛡️ 專用防塵蓋:</p>
              <Row name="隨座加購價 $10" count={items.coverAddon} onAdd={() => update('coverAddon', 1)} onSub={() => update('coverAddon', -1)} />
              <Row name="後期補買價 $15" count={items.coverSingle} onAdd={() => update('coverSingle', 1)} onSub={() => update('coverSingle', -1)} />
            </div>
          </Section>
        </div>

        <div style={formCardStyle}>
          <Section title="🔔 第二區：Clicker 系列">
            <Row name="🌸 粉紅白吉床 ($58)" count={items.clickerLuckyPink} onAdd={() => update('clickerLuckyPink', 1)} onSub={() => update('clickerLuckyPink', -1)} />
            <Row name="💎 藍白吉床 ($58)" count={items.clickerLuckyBlue} onAdd={() => update('clickerLuckyBlue', 1)} onSub={() => update('clickerLuckyBlue', -1)} />
            <Row name="✨ 吉床套裝 ($110)" count={items.clickerCombo} onAdd={() => update('clickerCombo', 1)} onSub={() => update('clickerCombo', -1)} />
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
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="收件人姓名" style={inputStyle} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
              <input placeholder="IG 帳號" style={inputStyle} value={shipping.igName} onChange={e => setShipping({...shipping, igName: e.target.value})} />
            </div>
            <input placeholder="聯絡電話號碼" style={inputStyle} value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
            <textarea placeholder="詳細收件地址 / 順豐代碼" style={{...inputStyle, height: '80px'} as any} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
            <input placeholder="備註事項 (Remarks)" style={{...inputStyle, border: '2px solid #77815C', marginTop: '5px'} as any} value={shipping.remarks} onChange={e => setShipping({...shipping, remarks: e.target.value})} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {!hasClicker && <Radio label="本地平郵" active={shipping.method === 'post'} onClick={() => setShipping({...shipping, method: 'post'})} />}
              <Radio label={isFreeSF ? "順豐站 (免運)" : "順豐站到付"} active={shipping.method === 'sf_station'} onClick={() => setShipping({...shipping, method: 'sf_station'})} />
              <Radio label={isFreeSF ? "智能櫃 (免運)" : "智能櫃到付"} active={shipping.method === 'sf_locker'} onClick={() => setShipping({...shipping, method: 'sf_locker'})} />
              <Radio label="送上門 (到付)" active={shipping.method === 'sf_direct'} onClick={() => setShipping({...shipping, method: 'sf_direct'})} />
            </div>
            <div style={addonCardStyle}>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#D63384' }}>💰 補錢湊數：${items.addonDiff}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => update('addonDiff', -1)} style={diffBtnStyle}>-1</button>
                <button onClick={() => update('addonDiff', 1)} style={diffBtnStyle}>+1</button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px' }}>
        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>📋 執貨單預覽</h3>
        <div ref={orderRef} style={orderDraftStyle}>
          <div style={orderHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#77815C' }}>NurseForgeHK</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginTop: '5px', color: '#666' }}>
              <span>ID: {orderId}</span>
              <span>DATE: {today}</span>
            </div>
          </div>
          <div style={orderInfoBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
               <span style={{ fontSize: '16px' }}><strong>IG:</strong> @{shipping.igName || '---'}</span>
               <span style={{ fontSize: '16px' }}><strong>Tel:</strong> {shipping.phone || '---'}</span>
            </div>
            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Recipient:</strong> {shipping.name || '---'}</p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Ship Via:</strong> {methodMap[shipping.method]}</p>
            <p style={{ margin: '5px 0', fontSize: '13px', lineHeight: '1.4', backgroundColor: '#fff', padding: '8px', borderRadius: '5px', border: '1px solid #f0f0f0' }}>
              <strong>Address:</strong><br/>{shipping.address || '未填寫'}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#D63384', fontStyle: 'italic' }}>
              <strong>Remarks:</strong> {shipping.remarks || '無'}
            </p>
          </div>
          <div style={{ minHeight: '80px', marginTop: '15px' }}>
            {activeProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '8px' }}>
                <span>{p.name} <b style={{ color: '#77815C' }}>x{p.qty}</b></span>
                <span style={{ fontWeight: 'bold' }}>${p.qty * p.price}</span>
              </div>
            ))}
          </div>
          <div style={orderTotalAreaStyle}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#77815C' }}>Total: HKD ${total}</div>
          </div>
        </div>

        <div style={agreementBoxStyle}>
           <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
             <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} style={{ width: '25px', height: '25px', marginTop: '3px' }} />
             <span style={{ fontSize: '14px', color: '#664d03', fontWeight: 'bold', lineHeight: '1.4' }}>
               我已檢查資訊正確。明白 3D 打印產品不設退換。揀選「本地平郵」即代表明白並同意承擔寄失風險，如有遺失需由買家自行負責。
             </span>
           </label>
        </div>
      </div>

      <div style={footerStyle}>
        <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '480px' }}>
          <button onClick={() => { if(!shipping.igName) return alert("填IG先！"); navigator.clipboard.writeText(`Order: ${shipping.igName}`); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={secondaryBtnStyle}>{copied ? "✅ 已複製" : "📋 複製 IG 名"}</button>
          <a href="https://payme.hsbc/nfhk" target="_blank" style={paymeBtnStyle}>立即 PayMe</a>
        </div>
        <button onClick={download} disabled={!agreed} style={{ ...primaryBtnStyle, backgroundColor: agreed ? '#77815C' : '#ccc' } as any}>下載執貨單並 DM 我</button>
      </div>
    </div>
  );
}

// 核心樣式定義 (全部加上 : any 以解決 TypeScript 類型問題)
const fabStyle: any = { position: 'fixed', right: '20px', bottom: '180px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 999, cursor: 'pointer', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const formCardStyle: any = { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', color: '#000' };
const orderDraftStyle: any = { backgroundColor: '#fff', padding: '30px', width: '100%', maxWidth: '420px', border: '5px solid #77815C', color: '#000' };
const orderHeaderStyle: any = { borderBottom: '3px solid #77815C', paddingBottom: '12px', marginBottom: '15px', textAlign: 'center' };
const orderInfoBoxStyle: any = { fontSize: '14px', marginBottom: '20px', lineHeight: '1.6', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px' };
const orderTotalAreaStyle: any = { borderTop: '3px dashed #eee', marginTop: '15px', paddingTop: '15px', textAlign: 'right' };
const agreementBoxStyle: any = { width: '100%', maxWidth: '420px', marginTop: '20px', padding: '15px', backgroundColor: '#FFF9E6', borderRadius: '12px', border: '1px solid #FFCC00' };
const footerStyle: any = { position: 'fixed', bottom: '0', width: '100%', left: '0', backgroundColor: '#fff', padding: '20px 20px 40px 20px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', zIndex: 1000 };
const inputStyle: any = { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '15px', marginBottom: '8px', color: '#000' };
const btnStyle: any = { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: '#f0f0f0', fontWeight: 'bold', cursor: 'pointer' };
const diffBtnStyle: any = { width: '40px', height: '40px', border: '2px solid #D63384', backgroundColor: '#fff', color: '#D63384', borderRadius: '10px', fontWeight: 'bold' };
const primaryBtnStyle: any = { width: '100%', maxWidth: '480px', padding: '18px', color: '#fff', border: 'none', borderRadius: '40px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' };
const secondaryBtnStyle: any = { flex: 1, padding: '14px', backgroundColor: '#fff', color: '#77815C', border: '2px solid #77815C', borderRadius: '12px', fontWeight: 'bold' };
const paymeBtnStyle: any = { flex: 2, padding: '14px', backgroundColor: '#FF002B', color: '#fff', textDecoration: 'none', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' };
const addonCardStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#FFF5F7', borderRadius: '15px', border: '2px solid #FFD1DC', marginTop: '25px' };

function ShowcaseCardMini({ img, title, price }: any) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } as any}>
      <img src={img} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' } as any} alt={title} />
      <div style={{ padding: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000' }}>{title}</div>
        <div style={{ fontSize: '16px', color: '#77815C', fontWeight: '900' }}>{price}</div>
      </div>
    </div>
  );
}
function Section({ title, children }: any) { return ( <div style={{ marginBottom: '15px' }}><h3 style={{ fontSize: '18px', fontWeight: '900', color: '#77815C', marginBottom: '15px', borderLeft: '6px solid #77815C', paddingLeft: '12px' } as any}>{title}</h3>{children}</div> ); }
function Row({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f2f2f2' } as any}><span style={{ fontSize: '15px', color: '#000', fontWeight: '600' }}>{name}</span><div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><button onClick={onSub} style={btnStyle}>−</button><span style={{ fontSize: '18px', fontWeight: '900', minWidth: '20px', textAlign: 'center' }}>{count}</span><button onClick={onAdd} style={btnStyle}>+</button></div></div> ); }
function RowMini({ name, count, onAdd, onSub }: any) { return ( <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #eee' } as any}><span style={{ fontSize: '13px', color: '#000', fontWeight: 'bold' }}>{name}</span><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button onClick={onSub} style={{...btnStyle, width: '24px', height: '24px'}}>−</button><span style={{ fontSize: '14px', fontWeight: '900' }}>{count}</span><button onClick={onAdd} style={{...btnStyle, width: '24px', height: '24px'}}>+</button></div></div> ); }
function Radio({ label, active, onClick }: any) { return ( <div onClick={onClick} style={{ padding: '10px 15px', borderRadius: '20px', border: `2px solid ${active ? '#77815C' : '#eee'}`, backgroundColor: active ? '#77815C' : '#fff', color: active ? '#fff' : '#000', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' } as any}>{label}</div> ); }