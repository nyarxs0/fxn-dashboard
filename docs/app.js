const navbar=document.getElementById('navbar'),overlay=document.getElementById('overlay'),hamburger=document.getElementById('hamburgerBtn');
function openNav(){navbar.classList.add('open');overlay.classList.add('show');}
function closeNav(){navbar.classList.remove('open');overlay.classList.remove('show');}
hamburger.addEventListener('click',()=>{navbar.classList.contains('open')?closeNav():openNav();});
overlay.addEventListener('click',closeNav);
function activate(t){
  document.querySelectorAll('.sidebtn').forEach(b=>b.classList.toggle('active',b.dataset.target===t));
  document.querySelectorAll('main section.page').forEach(s=>s.classList.remove('active'));
  document.getElementById(t).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  closeNav();
}
document.querySelectorAll('.sidebtn').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));

async function loadJSON(name){
  const res = await fetch('./data/'+name+'.json');
  return res.json();
}

function buildSparkline(history){
  const vals = history.map(h=>h.price);
  const min = Math.min(...vals), max = Math.max(...vals);
  const w = 220, h = 60, n = history.length;
  const pts = history.map((d,i)=>{
    const x = i*(w/(n-1));
    const y = h - ((d.price-min)/(max-min||1))*h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = history[history.length-1];
  const lastY = h - ((last.price-min)/(max-min||1))*h;
  return `<polyline points="${pts}" fill="none" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${w}" cy="${lastY.toFixed(1)}" r="3.5" fill="#d93025"/>`;
}
function buildHistoryChart(history){
  const vals = history.map(h=>h.price);
  const min = Math.min(...vals), max = Math.max(...vals);
  const w = 640, h = 120, n = history.length;
  let peakIdx=0; vals.forEach((v,i)=>{ if(v===max) peakIdx=i; });
  const pts = history.map((d,i)=>{ const x=i*(w/(n-1)); const y=h-((d.price-min)/(max-min||1))*h; return {x,y}; });
  const polyStr = pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const peak = pts[peakIdx], lastP = pts[pts.length-1];
  return `<polyline points="${polyStr}" fill="none" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${peak.x.toFixed(1)}" cy="${peak.y.toFixed(1)}" r="4" fill="#188038"/><circle cx="${lastP.x.toFixed(1)}" cy="${lastP.y.toFixed(1)}" r="4" fill="#d93025"/>`;
}

async function loadDashboard(){
  const [summary, rates, history] = await Promise.all([loadJSON('summary'), loadJSON('rates'), loadJSON('history')]);
  document.getElementById('insightlist').innerHTML = summary.insights.map(i=>`<li><span class="ico">${i.icon}</span>${i.text}</li>`).join('');
  document.getElementById('goldPriceBig').textContent = '$'+summary.goldPrice.toFixed(0);
  document.getElementById('goldValTitle').textContent = '$'+summary.goldPrice.toFixed(2);
  document.getElementById('goldDelta').textContent = (summary.goldChangePct>=0?'▲ +':'▼ ')+summary.goldChangePct+'% hari ini';
  document.getElementById('gaugeNum').textContent = summary.fedHikeOdds+'%';
  document.getElementById('gaugeEl').style.background = `conic-gradient(#f28c28 0% ${summary.fedHikeOdds}%, #e5e7eb ${summary.fedHikeOdds}% 100%)`;
  document.getElementById('sparkSvg').innerHTML = buildSparkline(history);
  document.getElementById('sparkCaption').textContent = `Puncak $${summary.peak30d.toLocaleString()} (${summary.peakDate}) → koreksi ke $${summary.goldPrice.toFixed(0)}.`;
  document.getElementById('ratesBars').innerHTML = rates.map(r=>`<div class="barrow"><div class="lbl">${r.flag} ${r.bank}</div><div class="track"><div class="fill" style="width:${r.pct}%;background:${r.pct>80?'#d93025':r.pct>50?'#f28c28':r.pct>20?'#f2c94c':'#188038'}"></div></div><div class="num">${r.rate}</div></div>`).join('');
}
async function loadCalendar(){
  const data = await loadJSON('calendar');
  document.querySelector('#calendarTable tbody').innerHTML = data.map(d=>`<tr><td>${d.date}</td><td>${d.event}</td><td>${d.country}</td><td><span class="impbadge imp-h">${d.impact}</span></td></tr>`).join('');
}
async function loadXau(){
  const data = await loadJSON('xauImpact');
  const cls = t => t==='down' ? 'pair-down' : t==='up' ? 'pair-up' : '';
  document.querySelector('#xauTable tbody').innerHTML = data.map(d=>`<tr><td>${d.news}</td><td>${d.mechanism}</td><td><span class="${cls(d.type)}">${d.direction}</span></td></tr>`).join('');
}
async function loadRatesTable(){
  const data = await loadJSON('rates');
  document.querySelector('#ratesTable tbody').innerHTML = data.map(r=>`<tr><td data-label="Bank">${r.flag} ${r.bank}</td><td data-label="Rate">${r.rate}</td><td data-label="Meeting">${r.nextMeeting}</td></tr>`).join('');
}
async function loadHistory(){
  const data = await loadJSON('history');
  document.getElementById('historyChart').innerHTML = buildHistoryChart(data);
  const max = Math.max(...data.map(d=>d.price)), lastDay = data[data.length-1];
  const peakDay = data.find(d=>d.price===max);
  document.getElementById('historyCaption').textContent = `Titik hijau = puncak ($${max.toLocaleString()}, ${peakDay.date}) · Titik merah = terakhir ($${lastDay.price.toLocaleString()}, ${lastDay.date})`;
  document.querySelector('#historyTable tbody').innerHTML = data.map(d=>`<tr><td>${d.date}</td><td>${d.price.toLocaleString('en-US',{minimumFractionDigits:2})}</td><td>${d.change}</td></tr>`).join('');
}
async function loadSessions(){
  const data = await loadJSON('sessions');
  document.querySelector('#sessionsTable tbody').innerHTML = data.map(s=>`<tr><td data-label="Sesi">${s.session}</td><td data-label="Jam">${s.hours}</td><td data-label="Karakter">${s.character}</td></tr>`).join('');
}
async function loadFeed(){
  const data = await loadJSON('feed');
  document.getElementById('feedContainer').innerHTML = data.map(f=>`<div class="feedcard ${f.type}"><div class="meta">${f.date} · ${f.tags}</div>${f.text}</div>`).join('');
}

function hitungSurprise(){
  const fc=parseFloat(document.getElementById('fc').value), ac=parseFloat(document.getElementById('ac').value);
  const el=document.getElementById('calcResult');
  if(isNaN(fc)||isNaN(ac)||fc===0){el.style.borderColor='#d93025';el.style.color='#d93025';el.textContent='Isi angka valid, Forecast tidak boleh 0.';return;}
  const s=((ac-fc)/Math.abs(fc))*100;
  let arah,warna;
  if(s>0){arah='POSITIF — mata uang MENGUAT jangka pendek';warna='#188038';}
  else if(s<0){arah='NEGATIF — mata uang MELEMAH jangka pendek';warna='#d93025';}
  else{arah='NETRAL';warna='#6b7684';}
  const k=Math.abs(s);
  const level=k>15?'BESAR (50-150 pip)':k>5?'SEDANG (20-60 pip)':'KECIL (<20 pip)';
  el.style.borderColor=warna;el.style.color=warna;
  el.innerHTML='Surprise = '+s.toFixed(2)+'%<br>Arah: '+arah+'<br>Kekuatan: '+level;
}
function estimasiXAU(){
  const val=document.getElementById('xauEvent').value, el=document.getElementById('xauResult');
  const map={
    cpi_high:{a:'TERTEKAN',k:'Inflasi panas → yield riil naik → opportunity cost gold naik.',w:'#d93025'},
    cpi_low:{a:'MENGUAT',k:'Inflasi dingin → rate lebih dovish → gold lebih menarik.',w:'#188038'},
    nfp_high:{a:'TERTEKAN',k:'Employment kuat → USD & yield naik.',w:'#d93025'},
    nfp_low:{a:'MENGUAT',k:'Employment lemah → ekspektasi Fed dovish → gold naik.',w:'#188038'},
    fomc_hawk:{a:'TERTEKAN',k:'Hawkish → yield naik tajam, gold bisa turun $30-80/oz.',w:'#d93025'},
    fomc_dove:{a:'MENGUAT',k:'Dovish/sinyal cut → yield turun, gold bisa naik signifikan.',w:'#188038'},
    riskoff:{a:'MENGUAT',k:'Permintaan safe-haven naik, bisa decouple dari USD.',w:'#188038'}
  };
  const r=map[val];
  el.style.borderColor=r.w;el.style.color=r.w;
  el.innerHTML='Estimasi: <strong>'+r.a+'</strong><br>'+r.k;
}

Promise.all([loadDashboard(), loadCalendar(), loadXau(), loadRatesTable(), loadHistory(), loadSessions(), loadFeed()]).catch(e=>console.error(e));
