const SetupScreen={render(){
 const ses=Store.getSession();if(!ses[0]||!ses[1])return LoginScreen.render();
 const l=Store.load().last||{};this.cat=l.cat||'fruit';this.count=l.count||8;this.first=l.first||'0';
 UI.$('#setup').innerHTML=`<div class="card"><h2>تنظیمات بازی</h2>
 <div class="who"><span>🧠 ${UI.esc(ses[0].id)}</span><b class="muted">در برابر</b><span>🎯 ${UI.esc(ses[1].id)}</span><button class="btn" id="chg" style="padding:4px 14px">تغییر بازیکنان</button></div>
 <div class="field"><label>نوع مهره‌ها</label><div class="chips" id="cats">${CATEGORIES.map(c=>`<div class="chip" data-id="${c.id}"><span class="e">${c.icon}</span>${c.name}</div>`).join('')}</div></div>
 <div class="field"><label>چه کسی در دور اول اول مهره را انتخاب کند؟</label><div class="opts" id="firsts">
 <div class="chip" data-v="0"><span class="e">🧠</span>${UI.esc(ses[0].first)}</div>
 <div class="chip" data-v="1"><span class="e">🎯</span>${UI.esc(ses[1].first)}</div>
 <div class="chip" data-v="r"><span class="e">🎲</span>قرعه‌کشی</div></div></div>
 <div class="field"><label>تعداد مهره‌ها: <b id="cv"></b></label><input type="range" id="cnt" min="${LIMITS.min}" max="${LIMITS.max}"></div>
 <div class="row"><button class="btn primary lg" id="start">شروع</button><button class="btn" id="back">بازگشت</button></div></div>`;
 const sync=()=>{document.querySelectorAll('#cats .chip').forEach(c=>c.classList.toggle('sel',c.dataset.id===this.cat));UI.$('#cv').textContent=UI.fa(this.count);document.querySelectorAll('#firsts .chip').forEach(c=>c.classList.toggle('sel',c.dataset.v===this.first))};
 document.querySelectorAll('#firsts .chip').forEach(c=>c.onclick=()=>{this.first=c.dataset.v;sync()});
 document.querySelectorAll('#cats .chip').forEach(c=>c.onclick=()=>{this.cat=c.dataset.id;sync()});
 const r=UI.$('#cnt');r.value=this.count;r.oninput=()=>{this.count=+r.value;sync()};sync();
 UI.$('#back').onclick=()=>IntroScreen.render();UI.$('#chg').onclick=()=>LoginScreen.render();
 UI.$('#start').onclick=()=>{Store.setLast({cat:this.cat,count:this.count,first:this.first});const f=this.first==='r'?Math.floor(Math.random()*2):+this.first;
  Engine.start(ses[0],ses[1],this.cat,this.count,f);GameScreen.render();UI.toast((f?ses[1].first:ses[0].first)+' اول شروع می‌کند 🎲')};
 UI.show('setup')}};
