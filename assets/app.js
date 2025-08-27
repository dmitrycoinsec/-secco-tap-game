
(function(){
  const box = document.createElement('div');
  box.id = 'diag';
  box.style.cssText = 'position:fixed;right:8px;bottom:110px;z-index:9999;background:#111;color:#fff;padding:6px 8px;border-radius:10px;font-size:11px;opacity:.85;display:none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(box));
  function show(msg){ box.style.display='block'; box.textContent = String(msg).slice(0,180); clearTimeout(box._t); box._t=setTimeout(()=>{box.style.display='none'}, 4000); }
  window.__diag__ = { show };
  window.addEventListener('error', e => show('ERR: '+(e?.message||'UI')), true);
  window.addEventListener('unhandledrejection', e => show('REJ: '+(e?.reason?.message||'Promise') ), true);
})();

const C = window.__SECCO_CONF__ || { API_BASE:"/api", TON_RECEIVER:"", TON_MANIFEST:"" };
const tg = window.Telegram?.WebApp; try{ tg?.ready?.(); tg?.expand?.(); }catch{}
const $=(s,r=document)=>r.querySelector(s);
function toast(t, type = 'info'){ 
  const el=$('#toast'); 
  if(!el){ alert(t); return; } 
  el.textContent=t; 
  el.className = `toast toast-${type}`;
  el.style.display='block'; 
  clearTimeout(el._t); 
  el._t=setTimeout(()=>el.style.display='none', 3000); 
}

let tonConnectUI=null, tonMounted=false, walletAddress = '';
async function initTon(){
  try{
    if(!window.TonConnectUI) return;
    const url = C.TON_MANIFEST; // HTTPS required
    if (!tonConnectUI) {
      tonConnectUI = new window.TonConnectUI({ 
        manifestUrl: url,
        uiPreferences: {
          theme: 'LIGHT',
          colorsSet: {
            [window.THEME.LIGHT]: {
              connectButton: {
                background: '#2D62EC',
                foreground: '#FFFFFF',
              },
              accent: '#2D62EC',
              telegramButton: '#2D62EC',
              background: {
                primary: '#F7F9FF',
                secondary: '#FFFFFF',
                segment: '#F7F9FF',
              },
              text: {
                primary: '#0B1221',
                secondary: '#6B7280',
              }
            }
          }
        }
      });
    }
    
    tonConnectUI.onStatusChange?.((w)=>{
      const connected = !!(w && (w.account?.address || w.wallet?.account?.address));
      walletAddress = w?.account?.address || w?.wallet?.account?.address || '';
      const el=$('#wallet-status'); 
      if(el) {
        el.textContent = connected ? 'Подключен' : 'Не подключен';
        el.classList.toggle('connected', connected);
      }
      
      // Обновляем профиль если он открыт
      if (location.hash.includes('profile')) {
        updateProfileWalletStatus();
      }
    });
    
    if(!tonMounted){ 
      tonConnectUI.mountWalletButton('#connect-root'); 
      tonMounted=true; 
    }
    
    const st = tonConnectUI?.account?.address || tonConnectUI?.wallet?.account?.address || '';
    walletAddress = st;
    const el=$('#wallet-status'); 
    if(el) {
      el.textContent = st ? 'Подключен' : 'Не подключен';
      el.classList.toggle('connected', !!st);
    }
  }catch(e){ 
    console.warn('TonConnect init error', e); 
    window.__diag__?.show('TonConnect ERR');
    toast('Ошибка инициализации TON Connect', 'error');
  }
}
setInterval(initTon, 2000);

// State
const S = {
  taps: parseFloat(localStorage.getItem('secco_taps')||'0'),
  energy: parseFloat(localStorage.getItem('secco_energy')||'100'),
  maxEnergy: parseFloat(localStorage.getItem('secco_max_energy')||'100'),
  combo: parseFloat(localStorage.getItem('secco_combo')||'1'),
  secco: parseFloat(localStorage.getItem('secco_balance')||'0'),
  level: parseFloat(localStorage.getItem('secco_level')||'1'),
  experience: parseFloat(localStorage.getItem('secco_experience')||'0'),
  totalEarned: parseFloat(localStorage.getItem('secco_total_earned')||'0'),
  achievements: JSON.parse(localStorage.getItem('secco_achievements')||'[]'),
  shopHistory: JSON.parse(localStorage.getItem('secco_shop_history')||'[]'),
  lastTick: Date.now(),
};
function save(){ 
  localStorage.setItem('secco_taps', S.taps); 
  localStorage.setItem('secco_energy', S.energy);
  localStorage.setItem('secco_max_energy', S.maxEnergy);
  localStorage.setItem('secco_combo', S.combo); 
  localStorage.setItem('secco_balance', S.secco);
  localStorage.setItem('secco_level', S.level);
  localStorage.setItem('secco_experience', S.experience);
  localStorage.setItem('secco_total_earned', S.totalEarned);
  if (S.achievements) {
    localStorage.setItem('secco_achievements', JSON.stringify(S.achievements));
  }
  if (S.shopHistory) {
    localStorage.setItem('secco_shop_history', JSON.stringify(S.shopHistory));
  }
}

async function api(path, opt={}){
  try{
    const res = await fetch((C.API_BASE||'')+path, Object.assign({ headers:{ "Content-Type":"application/json","X-TG-Init": tg?.initData || "" }}, opt));
    return await res.json();
  }catch(e){ return null }
}

function PageGame(){
  const expNeeded = S.level * 100;
  const expProgress = Math.min(100, (S.experience / expNeeded) * 100);
  
  const v = `<main class="container">
    <section class="card">
      <div class="stats">
        <div><div class="notice">Уровень ${S.level}</div><div class="counter">${S.experience}/${expNeeded} XP</div>
          <div class="quest-progress"><div class="quest-progress-bar" style="width: ${expProgress}%"></div></div>
        </div>
        <div><div class="notice">Энергия</div><div><span id="energy">${Math.floor(S.energy)}</span> / <span id="max">${S.maxEnergy}</span></div></div>
        <div><div class="notice">SECCO</div><div id="secco-balance">${S.secco.toFixed(2)}</div></div>
      </div>
      <div class="stats">
        <div><div class="notice">Клики</div><div id="taps" class="counter">${Math.floor(S.taps)}</div></div>
        <div><div class="notice">Комбо</div><div id="combo">x${S.combo.toFixed(1)}</div></div>
        <div><div class="notice">Всего заработано</div><div>${S.totalEarned.toFixed(2)} SECCO</div></div>
      </div>
      <div class="tap"><div class="tap-ring"><button id="tap" class="tap-btn">TAP TO EARN</button></div></div>
      <div class="notice">1 тап = +0.01 SECCO | +1 XP</div>
    </section>
    <section class="card">
      <div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Лидерборд</h3><button class="btn secondary" id="refresh">Обновить</button></div>
      <ol class="lb" id="lb"><li><span>—</span><span>Загрузка…</span><span style="text-align:right">—</span></li></ol>
    </section>
  </main>`;
  queueMicrotask(()=>boot());
  return v;
  async function boot(){
    const taps=$('#taps'), energy=$('#energy'), max=$('#max'), combo=$('#combo'), tap=$('#tap');
    async function doTap(){
      if(S.energy<1){ toast('Недостаточно энергии', 'warning'); return }
      S.energy-=1;
      const earned = 0.01 * Math.max(1, S.combo);
      S.secco += earned;
      S.totalEarned += earned;
      S.taps += 1;
      S.combo = Math.min(3.0, S.combo + 0.05);
      
      // Добавляем опыт и проверяем достижения
      addExperience(1);
      checkAchievements();
      
      taps.textContent = Math.floor(S.taps);
      energy.textContent = Math.floor(S.energy);
      combo.textContent = 'x'+S.combo.toFixed(1);
      
      // Добавляем анимацию кнопки
      if(tap) {
        tap.style.transform = 'scale(0.95)';
        setTimeout(() => tap.style.transform = 'scale(1)', 100);
      }
      
      save();
    }
    tap?.addEventListener('pointerdown', ()=>{ doTap(); }, {passive:true});
    $('#refresh')?.addEventListener('click', loadLB);
    loadLB();
    async function loadLB(){
      const lb=$('#lb'); if(!lb) return; lb.innerHTML='';
      const items = [{name:'Player 1',score:1200},{name:'Player 2',score:980},{name:'You',score:Math.floor(S.taps)}];
      items.forEach((row,i)=>{ const li=document.createElement('li'); li.innerHTML=`<span>${i+1}</span><span>${row.name}</span><span style="text-align:right;font-weight:700">${row.score}</span>`; lb.appendChild(li); });
    }
  }
}

function PageShop(){
  const v = `<main class="container">
    <div class="card">
      <b>💰 Ваш баланс</b>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0">
        <div style="text-align:center;padding:12px;background:var(--ring);border-radius:12px">
          <div class="notice">SECCO</div>
          <div style="font-weight:700;font-size:18px">${S.secco.toFixed(2)}</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--ring);border-radius:12px">
          <div class="notice">Энергия</div>
          <div style="font-weight:700;font-size:18px">${Math.floor(S.energy)}/${S.maxEnergy}</div>
        </div>
      </div>
    </div>
    
    <div class="card-list">
      <div class="item">
        <div class="badge">За SECCO</div>
        <h4 class="shop-title">+1000 энергии</h4>
        <div class="shop-desc">Быстрое восстановление энергии</div>
        <div class="price">50 SECCO</div>
        <button class="btn" id="buyEnergy1" ${S.secco < 50 ? 'disabled' : ''}>Купить</button>
      </div>
      
      <div class="item">
        <div class="badge">За SECCO</div>
        <h4 class="shop-title">+10000 энергии</h4>
        <div class="shop-desc">Большой запас энергии</div>
        <div class="price">500 SECCO</div>
        <button class="btn" id="buyEnergy2" ${S.secco < 500 ? 'disabled' : ''}>Купить</button>
      </div>
      
      <div class="item">
        <div class="badge">За SECCO</div>
        <h4 class="shop-title">x2 Комбо на 1 час</h4>
        <div class="shop-desc">Удваивает заработок с комбо</div>
        <div class="price">25 SECCO</div>
        <button class="btn" id="buyCombo" ${S.secco < 25 ? 'disabled' : ''}>Купить</button>
      </div>
      
      <div class="item">
        <div class="badge">За TON</div>
        <h4 class="shop-title">+1000 энергии</h4>
        <div class="shop-desc">Мгновенно пополнить запас</div>
        <div class="price">1 TON</div>
        <button class="btn" id="buy1">Купить</button>
      </div>
      
      <div class="item">
        <div class="badge">За TON</div>
        <h4 class="shop-title">+10000 энергии</h4>
        <div class="shop-desc">Большой пак для марафона</div>
        <div class="price">10 TON</div>
        <button class="btn" id="buy10">Купить</button>
      </div>
      
      <div class="item">
        <div class="badge">За TON</div>
        <h4 class="shop-title">Купить SECCO</h4>
        <div class="shop-desc">Курс: 10 SECCO = 1 TON</div>
        <div style="display:flex;gap:8px;align-items:center">
          <input id="amt" class="input" type="number" value="10" min="10" step="10" style="padding:8px 10px;border:1px solid var(--border);border-radius:10px;width:120px;background:#fff">
          <button class="btn" id="buyS">Купить</button>
        </div>
      </div>
    </div>
    
    <div class="card" id="shop-history">
      <b>📋 История покупок</b>
      <div id="history-list">
        ${S.shopHistory.length === 0 ? '<div class="notice" style="text-align:center;padding:20px">Покупок пока нет</div>' : ''}
      </div>
    </div>
  </main>`; queueMicrotask(boot); return v;

  function updateShopUI() {
    const historyList = $('#history-list');
    if (historyList && S.shopHistory.length > 0) {
      const historyHtml = S.shopHistory.slice(-10).reverse().map(item => {
        return `<div class="history-item">
          <div>
            <div style="font-weight:600">${item.item}</div>
            <div class="notice">${new Date(item.date).toLocaleString()}</div>
          </div>
          <div style="font-weight:600;color:var(--success)">${item.price}</div>
        </div>`;
      }).join('');
      historyList.innerHTML = historyHtml;
    }
  }

  function boot(){
    updateShopUI();
    
    const buyTon = async (nano, itemName, reward)=>{
      await initTon();
      if(!tonConnectUI) return toast('Подключите TonConnect', 'warning');
      
      toast('Подготовка транзакции...', 'info');
      
      try{
        const transaction = {
          validUntil: Math.floor(Date.now()/1000)+300,
          messages:[{address:C.TON_RECEIVER, amount:String(nano)}]
        };
        
        await tonConnectUI.sendTransaction(transaction);
        
        // Записываем покупку в историю
        const purchase = {
          item: itemName,
          price: `${nano/1_000_000_000} TON`,
          date: Date.now()
        };
        S.shopHistory.push(purchase);
        
        // Применяем награду
        if (reward) reward();
        
        save();
        toast(`✅ Покупка успешна: ${itemName}`, 'success');
        updateShopUI();
        
      }catch(e){ 
        console.warn('Transaction error:', e);
        toast('❌ Транзакция отменена или не удалась', 'error');
      }
    };
    
    // SECCO покупки
    $('#buyEnergy1')?.addEventListener('click', ()=>{
      if(S.secco >= 50) {
        S.secco -= 50;
        S.energy = Math.min(S.maxEnergy, S.energy + 1000);
        S.shopHistory.push({item: '+1000 энергии', price: '50 SECCO', date: Date.now()});
        save();
        toast('✅ +1000 энергии!', 'success');
        updateShopUI();
        setTimeout(() => location.reload(), 1000); // Обновляем UI
      }
    });
    
    $('#buyEnergy2')?.addEventListener('click', ()=>{
      if(S.secco >= 500) {
        S.secco -= 500;
        S.energy = Math.min(S.maxEnergy, S.energy + 10000);
        S.shopHistory.push({item: '+10000 энергии', price: '500 SECCO', date: Date.now()});
        save();
        toast('✅ +10000 энергии!', 'success');
        updateShopUI();
        setTimeout(() => location.reload(), 1000);
      }
    });
    
    $('#buyCombo')?.addEventListener('click', ()=>{
      if(S.secco >= 25) {
        S.secco -= 25;
        S.combo = Math.min(3.0, S.combo * 2);
        S.shopHistory.push({item: 'x2 Комбо бустер', price: '25 SECCO', date: Date.now()});
        save();
        toast('✅ Комбо удвоен!', 'success');
        updateShopUI();
        setTimeout(() => location.reload(), 1000);
      }
    });
    
    // TON покупки
    $('#buy1')?.addEventListener('click', ()=>buyTon(1_000_000_000, '+1000 энергии', ()=>{
      S.energy = Math.min(S.maxEnergy, S.energy + 1000);
    }));
    
    $('#buy10')?.addEventListener('click', ()=>buyTon(10_000_000_000, '+10000 энергии', ()=>{
      S.energy = Math.min(S.maxEnergy, S.energy + 10000);
    }));
    
    $('#buyS')?.addEventListener('click', async ()=>{
      const secco = Math.max(10, parseInt($('#amt')?.value||'10',10));
      const nano = Math.floor((secco/10)*1_000_000_000);
      await buyTon(nano, `${secco} SECCO`, ()=>{
        S.secco += secco;
      });
    });
  }
}

function PageWheel(){
  const v = `<main class="container">
    <section class="card">
      <h3 style="margin:0 0 8px 0">Колесо удачи</h3>
      <div class="wheel-wrap">
        <div class="wheel" id="wheel">
          <div class="wheel-label">SPIN</div>
        </div>
      </div>
      <div class="pointer"></div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
        <button class="btn" id="spin">Крутить</button>
        <button class="btn secondary" id="rules">Правила</button>
      </div>
    </section>
  </main>`;
  queueMicrotask(boot); return v;

  function boot(){
    const wheel = $('#wheel'); const spinBtn=$('#spin'); const rules=$('#rules');
    const prizes = [
      {label:'+50 энергии', type:'energy', val:50, color:'#e8f0ff'},
      {label:'+5 SECCO', type:'secco', val:5, color:'#fff3e6'},
      {label:'+100 энергии', type:'energy', val:100, color:'#e8ffe8'},
      {label:'+10 SECCO', type:'secco', val:10, color:'#f3e8ff'},
      {label:'+0', type:'none', val:0, color:'#ffe8e8'},
      {label:'+25 SECCO', type:'secco', val:25, color:'#e8f7ff'}
    ];
    const n = prizes.length;
    for(let i=0;i<n;i++){
      const seg = document.createElement('div');
      seg.className='segment';
      seg.style.transform = `translate(-50%,-50%) rotate(${(360/n)*i}deg)`;
      seg.style.borderTop = `80px solid ${prizes[i].color}`;
      seg.style.borderLeft = '0 solid transparent';
      seg.style.borderRight = '160px solid transparent';
      wheel.appendChild(seg);
    }
    let spinning=false, angle=0;
    spinBtn.addEventListener('click', ()=>{
      if(spinning) return;
      spinning=true;
      const target = Math.floor(Math.random()*n);
      const turns = 5;
      const segAngle = 360/n;
      const targetAngle = 360 - (target*segAngle + segAngle/2);
      const final = turns*360 + targetAngle;
      wheel.style.transition = 'transform 3s cubic-bezier(.2,.8,.1,1)';
      angle += final;
      wheel.style.transform = `rotate(${angle}deg)`;
      setTimeout(()=>{
        spinning=false;
        const prize = prizes[target];
        if(prize.type==='energy'){ S.energy = Math.min(S.maxEnergy, S.energy + prize.val); toast(`Выигрыш: +${prize.val} энергии`); }
        if(prize.type==='secco'){ S.secco += prize.val; toast(`Выигрыш: +${prize.val} SECCO`); }
        save();
      }, 3100);
    });
    rules.addEventListener('click', ()=>toast('Крутите колесо и забирайте призы!'));
  }
}

function PageQuests(){
  return `<main class="container">
    <div class="card">
      <div class="badge">Квест</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
        <div>
          <div style="font-weight:700">100 кликов</div>
          <div class="notice">Сделай 100 кликов — получи 10 SECCO</div>
        </div>
        <button class="btn" id="q1">Забрать</button>
      </div>
    </div>
    <div class="card">
      <div class="badge">Реферал</div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <input id="ref" class="input" readonly value="..." style="padding:8px 10px;border:1px solid var(--border);border-radius:10px;flex:1;background:#fff"/>
        <button class="btn secondary" id="copy">Копировать</button>
      </div>
    </div>
  </main>`;
}
function bootQuests(){
  const id = tg?.initDataUnsafe?.user?.id || '';
  const link = `https://t.me/secco_game_bot?start=ref_${id}`;
  const ref = $('#ref'); if(ref) ref.value = id?link:'Откройте через Telegram';
  $('#copy')?.addEventListener('click', ()=>{ navigator.clipboard?.writeText(ref?.value||''); toast('Скопировано'); });
  $('#q1')?.addEventListener('click', ()=>{
    if(S.taps>=100){ S.secco+=10; save(); toast('+10 SECCO начислено'); }
    else toast('Сделай 100 кликов сначала');
  });
}

function PageProfile(){
  const name = tg?.initDataUnsafe?.user?.username || tg?.initDataUnsafe?.user?.first_name || 'Guest';
  const userId = tg?.initDataUnsafe?.user?.id || 'N/A';
  
  const achievementsList = [
    { id: 'first_100', name: '100 кликов', desc: 'Сделать 100 кликов' },
    { id: 'first_1000', name: '1000 кликов', desc: 'Сделать 1000 кликов' },
    { id: 'combo_master', name: 'Мастер комбо', desc: 'Достичь комбо x2.5' },
    { id: 'earner', name: 'Заработок', desc: 'Заработать 100 SECCO' },
    { id: 'level_master', name: 'Мастер уровней', desc: 'Достичь 5 уровня' }
  ];
  
  const achievementsHtml = achievementsList.map(ach => {
    const unlocked = S.achievements.includes(ach.id);
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600">${unlocked ? '🏆' : '🔒'} ${ach.name}</div>
        <div class="notice">${ach.desc}</div>
      </div>
      <div style="color:${unlocked ? 'var(--success)' : 'var(--muted)'};font-weight:600">
        ${unlocked ? 'Разблокировано' : 'Заблокировано'}
      </div>
    </div>`;
  }).join('');
  
  return `<main class="container">
    <div class="profile-card">
      <b>Профиль</b>
      <div>👤 ${name}</div>
      <div>🆔 ID: ${userId}</div>
      <div>💰 SECCO баланс: <b id="bal">${S.secco.toFixed(2)}</b></div>
      <div>📈 Всего заработано: <b>${S.totalEarned.toFixed(2)} SECCO</b></div>
      <div>⭐ Уровень: <b>${S.level}</b></div>
      <div>✨ Опыт: <b>${S.experience}/${S.level * 100}</b></div>
      <div>⚡ Макс. энергия: <b>${S.maxEnergy}</b></div>
      <div>👆 Всего кликов: <b>${Math.floor(S.taps)}</b></div>
      <div>🔥 Макс. комбо: <b>x${S.combo > 3 ? '3.0+' : S.combo.toFixed(1)}</b></div>
    </div>
    
    <div class="wallet-card">
      <b>Кошелёк</b>
      <div id="wstat" class="notice">Статус: <span id="wtxt">—</span></div>
      <div id="wallet-addr" class="notice" style="margin-top:4px"></div>
      <div style="margin-top:8px"><button class="btn secondary" id="openTon">Подключить/Отключить</button></div>
    </div>
    
    <div class="profile-card">
      <b>Достижения (${S.achievements.length}/${achievementsList.length})</b>
      ${achievementsHtml}
    </div>
  </main>`;
}
function updateProfileWalletStatus() {
  const connected = !!(tonConnectUI && (tonConnectUI.account?.address || tonConnectUI.wallet?.account?.address));
  const wtxt = $('#wtxt');
  const walletAddr = $('#wallet-addr');
  
  if (wtxt) wtxt.textContent = connected ? 'Подключен' : 'Не подключен';
  if (walletAddr && connected && walletAddress) {
    walletAddr.textContent = `Адрес: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
  } else if (walletAddr) {
    walletAddr.textContent = '';
  }
}

function bootProfile(){
  updateProfileWalletStatus();
  $('#openTon')?.addEventListener('click', async ()=>{
    await initTon();
    try{
      if(tonConnectUI?.account?.address || tonConnectUI?.wallet?.account?.address){ 
        await tonConnectUI.disconnect(); 
        toast('Кошелек отключен', 'info');
      } else { 
        await tonConnectUI.openModal(); 
      }
    }catch(e){ 
      console.warn('Wallet action error:', e);
      toast('Ошибка при работе с кошельком', 'error');
    }
  });
}

function PageSettings(){
  return `<main class="container">
    <div class="setting-card"><b>Тема</b><div class="notice">Светлая</div></div>
    <div class="setting-card"><b>Сброс</b><div class="notice">Очистить локальные данные игры</div><button class="btn secondary" id="reset">Сбросить</button></div>
  </main>`;
}
function bootSettings(){ $('#reset')?.addEventListener('click', ()=>{ localStorage.clear(); location.reload(); }); }

function render(){
  const r = (location.hash.replace('#','')||'game');
  const icons = {
    game: '<i data-lucide="gamepad-2"></i>',
    shop: '<i data-lucide="shopping-cart"></i>',
    wheel: '<i data-lucide="crown"></i>',
    quests: '<i data-lucide="map"></i>',
    profile: '<i data-lucide="user"></i>'
  };
  const nav = (id,label)=>`<a href="#${id}" class="${r===id?'active':''}" aria-label="${id}">${icons[id]}<span>${label}</span></a>`;
  $('#nav').innerHTML = nav('game','Игра')+nav('shop','Магазин')+nav('wheel','Колесо')+nav('quests','Квесты')+nav('profile','Профиль');
  
  let view = PageGame(); 
  if(r==='shop') view=PageShop(); 
  if(r==='wheel') view=PageWheel(); 
  if(r==='quests') view=PageQuests(); 
  if(r==='profile') view=PageProfile(); 
  if(r==='settings') view=PageSettings();
  
  $('#app').innerHTML = view;
  
  // Initialize Lucide icons
  if(typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  if(r==='quests') bootQuests();
  if(r==='profile') bootProfile();
  if(r==='settings') bootSettings();
  initTon();
}
addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', ()=>{
  setInterval(()=>{
    const now = Date.now(); const dt = (now - S.lastTick)/1000; S.lastTick = now;
    if(S.energy < S.maxEnergy) S.energy = Math.min(S.maxEnergy, S.energy + dt/2);
    if(S.combo > 1) S.combo = Math.max(1, S.combo - dt*0.02);
    const e=$('#energy'), c=$('#combo'); if(e) e.textContent = Math.floor(S.energy); if(c) c.textContent = 'x'+S.combo.toFixed(1);
    save();
  }, 1000);
  render();
});

// Система достижений
function checkAchievements() {
  if (!S.achievements) S.achievements = [];
  const newAchievements = [];
  
  if (S.taps >= 100 && !S.achievements.includes('first_100')) {
    newAchievements.push('first_100');
    S.secco += 5;
    toast('🏆 Достижение: Первые 100 кликов! +5 SECCO', 'success');
  }
  
  if (S.taps >= 1000 && !S.achievements.includes('first_1000')) {
    newAchievements.push('first_1000');
    S.secco += 20;
    toast('🏆 Достижение: 1000 кликов! +20 SECCO', 'success');
  }
  
  if (S.combo >= 2.5 && !S.achievements.includes('combo_master')) {
    newAchievements.push('combo_master');
    S.secco += 15;
    toast('🏆 Достижение: Мастер комбо! +15 SECCO', 'success');
  }
  
  if (S.totalEarned >= 100 && !S.achievements.includes('earner')) {
    newAchievements.push('earner');
    S.secco += 25;
    toast('🏆 Достижение: Заработок! +25 SECCO', 'success');
  }
  
  if (S.level >= 5 && !S.achievements.includes('level_master')) {
    newAchievements.push('level_master');
    S.secco += 50;
    toast('🏆 Достижение: Мастер уровней! +50 SECCO', 'success');
  }
  
  if (newAchievements.length > 0) {
    S.achievements.push(...newAchievements);
    save();
  }
}

// Система уровней
function addExperience(amount) {
  S.experience += amount;
  const expNeeded = S.level * 100;
  
  if (S.experience >= expNeeded) {
    S.level++;
    S.experience -= expNeeded;
    S.maxEnergy += 10;
    S.energy = S.maxEnergy; // Восстанавливаем энергию при повышении уровня
    toast(`🎉 Уровень повышен! Новый уровень: ${S.level}. +10 макс. энергии!`, 'success');
    save();
    
    // Обновляем UI если находимся на странице игры
    const energyEl = $('#energy');
    const maxEl = $('#max');
    if (energyEl) energyEl.textContent = Math.floor(S.energy);
    if (maxEl) maxEl.textContent = S.maxEnergy;
  }
}

// Улучшенная функция сохранения
function save(){ 
  localStorage.setItem('secco_taps', S.taps); 
  localStorage.setItem('secco_energy', S.energy);
  localStorage.setItem('secco_combo', S.combo); 
  localStorage.setItem('secco_balance', S.secco);
  localStorage.setItem('secco_level', S.level);
  localStorage.setItem('secco_experience', S.experience);
  localStorage.setItem('secco_total_earned', S.totalEarned);
  if (S.achievements) {
    localStorage.setItem('secco_achievements', JSON.stringify(S.achievements));
  }
}
