const navbar=document.getElementById('navbar'),overlay=document.getElementById('overlay'),hamburger=document.getElementById('hamburgerBtn');
function openNav(){navbar.classList.add('open');overlay.classList.add('show');}
function closeNav(){navbar.classList.remove('open');overlay.classList.remove('show');}
hamburger.addEventListener('click',()=>{navbar.classList.contains('open')?closeNav():openNav();});
overlay.addEventListener('click',closeNav);
function activate(t){
  document.querySelectorAll('.navbtn,.sidebtn').forEach(b=>b.classList.toggle('active',b.dataset.target===t));
  document.querySelectorAll('main section.page').forEach(s=>s.classList.remove('active'));
  document.getElementById(t).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  closeNav();
}
document.querySelectorAll('.navbtn,.sidebtn').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));

async function api(path){
  const res = await fetch('/api/'+path);
  if(!res.ok) throw new Error('API error '+path);
  return res.json();
}

function buildSparkline(history){
  const vals = history.map(h=>h.price);
  const min = Math.min(...vals), max = Math.max(...vals);
  const w = 220, h = 60;
  const n = history.length;
  const pts = history.map((d,i)=>{
    const x = i*(w/(n-1));
    const y = h - ((d.price-min)/(max-min||1))*h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = history[history.length-1];
  const lastX = w, lastY = h - ((last.price-min)/(max-min||1))*h;
  return `<polyline points="${pts}" fill="none" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${lastX}" cy="${lastY.toFixed(1)}" r="3.5" fill="#d93025"/>`;
}

function buildHistoryChart(history){
  const vals = history.map(h=>h.price);
  const min = Math.min(...vals), max = Math.max(...vals);
  const w = 640, h = 120;
  const n = history.length;
  let peakIdx=0; vals.forEach((v,i)=>{ if(v===max) peakIdx=i; });
  const pts = history.map((d,i)=>{
    const x = i*(w/(n-1));
    const y = h - ((d.price-min)/(max-min||1))*h;
    return {x,y};
  });
  const polyStr = pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const peak = pts[peakIdx], lastP = pts[pts.length-1];
  return `<polyline points="${polyStr}" fill="none" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${peak.x.toFixed(1)}" cy="${peak.y.toFixed(1)}" r="4" fill="#188038"/><circle cx="${lastP.x.toFixed(1)}" cy="${lastP.y.toFixed(1)}" r="4" fill="#d93025"/>`;
}

async function loadDashboard(){
  try{
    const [summary, rates, history] = await Promise.all([api('summary'), api('rates'), api('history')]);
    document.getElementById('insightlist').innerHTML = summary.insights.map(i=>`<li><span class="ico">${i.icon}</span>${i.text}</li>`).join('');
    document.getElementById('goldPriceBig').textContent = '$'+summary.goldPrice.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0});
    document.getElementById('goldValTitle').textContent = '$'+summary.goldPrice.toFixed(2);
    document.getElementById('goldDelta').textContent = (summary.goldChangePct>=0?'▲ +':'▼ ')+summary.goldChangePct+'% hari ini';
    document.getElementById('gaugeNum').textContent = summary.fedHikeOdds+'%';
    document.getElementById('gaugeEl').style.background = `conic-gradient(#f28c28 0% ${summary.fedHikeOdds}%, #e5e7eb ${summary.fedHikeOdds}% 100%)`;
    document.getElementById('sparkSvg').innerHTML = buildSparkline(history);
    document.getElementById('sparkCaption').textContent = `Puncak $${summary.peak30d.toLocaleString()} (${summary.peakDate}) → koreksi ke $${summary.goldPrice.toFixed(0)}. Detail di tab "30 Hari".`;
    document.getElementById('ratesBars').innerHTML = rates.map(r=>`<div class="barrow"><div class="lbl">${r.flag} ${r.bank}</div><div class="track"><div class="fill" style="width:${r.pct}%;background:${r.pct>80?'#d93025':r.pct>50?'#f28c28':r.pct>20?'#f2c94c':'#188038'}"></div></div><div class="num">${r.rate}</div></div>`).join('');
  }catch(e){ console.error(e); }
}

async function loadCalendar(){
  const data = await api('calendar');
  document.querySelector('#calendarTable tbody').innerHTML = data.map(d=>`<tr><td>${d.date}</td><td>${d.event}</td><td>${d.country}</td><td><span class="impbadge imp-h">${d.impact}</span></td></tr>`).join('');
}

async function loadXau(){
  const data = await api('xauusd');
  const cls = t => t==='down' ? 'pair-down' : t==='up' ? 'pair-up' : '';
  document.querySelector('#xauTable tbody').innerHTML = data.map(d=>`<tr><td>${d.news}</td><td>${d.mechanism}</td><td><span class="${cls(d.type)}">${d.direction}</span></td></tr>`).join('');
}

async function loadRatesTable(){
  const data = await api('rates');
  document.querySelector('#ratesTable tbody').innerHTML = data.map(r=>`<tr><td data-label="Bank">${r.flag} ${r.bank}</td><td data-label="Rate">${r.rate}</td><td data-label="Meeting">${r.nextMeeting}</td></tr>`).join('');
}

async function loadHistory(){
  const data = await api('history');
  document.getElementById('historyChart').innerHTML = buildHistoryChart(data);
  const max = Math.max(...data.map(d=>d.price)), min = Math.min(...data.map(d=>d.price));
  const peakDay = data.find(d=>d.price===max), lastDay = data[data.length-1];
  document.getElementById('historyCaption').textContent = `Titik hijau = puncak 30 hari ($${max.toLocaleString()}, ${peakDay.date}) · Titik merah = harga terakhir ($${lastDay.price.toLocaleString()}, ${lastDay.date})`;
  document.querySelector('#historyTable tbody').innerHTML = data.map(d=>`<tr><td>${d.date}</td><td>${d.price.toLocaleString('en-US',{minimumFractionDigits:2})}</td><td>${d.change}</td></tr>`).join('');
}

async function loadSessions(){
  const data = await api('sessions');
  document.querySelector('#sessionsTable tbody').innerHTML = data.map(s=>`<tr><td data-label="Sesi">${s.session}</td><td data-label="Jam">${s.hours}</td><td data-label="Karakter">${s.character}</td></tr>`).join('');
}

async function loadFeed(){
  const data = await api('feed');
  document.getElementById('feedContainer').innerHTML = data.map(f=>`<div class="feedcard ${f.type}"><div class="meta">${f.date} · ${f.tags}</div>${f.text}</div>`).join('');
}

async function hitungSurprise(){
  const fc = parseFloat(document.getElementById('fc').value);
  const ac = parseFloat(document.getElementById('ac').value);
  const el = document.getElementById('calcResult');
  try{
    const res = await fetch('/api/surprise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({forecast:fc,actual:ac})});
    const data = await res.json();
    if(!res.ok){ el.style.borderColor='#d93025'; el.style.color='#d93025'; el.textContent=data.error; return; }
    const warna = data.surprise>0?'#188038':data.surprise<0?'#d93025':'#6b7684';
    el.style.borderColor=warna; el.style.color=warna;
    el.innerHTML = 'Surprise = '+data.surprise+'%<br>Arah: '+data.direction+'<br>Kekuatan: '+data.strength;
  }catch(e){ el.textContent='Gagal menghubungi server.'; }
}

async function estimasiXAU(){
  const val = document.getElementById('xauEvent').value;
  const el = document.getElementById('xauResult');
  try{
    const res = await fetch('/api/xau-scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:val})});
    const data = await res.json();
    if(!res.ok){ el.textContent = data.error; return; }
    const warna = data.arah==='MENGUAT'?'#188038':'#d93025';
    el.style.borderColor=warna; el.style.color=warna;
    el.innerHTML = 'Estimasi: <strong>'+data.arah+'</strong><br>'+data.ket;
  }catch(e){ el.textContent='Gagal menghubungi server.'; }
}

Promise.all([loadDashboard(), loadCalendar(), loadXau(), loadRatesTable(), loadHistory(), loadSessions(), loadFeed()]).catch(e=>console.error(e));
