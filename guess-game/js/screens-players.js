const PlayersScreen={render(){
 const L=Store.list();
 UI.$('#players').innerHTML=`<div class="card"><h2>بازیکنان و سوابق</h2>${L.length?`<div style="overflow-x:auto"><table><tr><th>#</th><th>بازیکن</th><th>بازی</th><th>برد</th><th>امتیاز</th></tr>
 ${L.map((p,i)=>`<tr class="go" data-id="${UI.esc(p.id)}"><td>${UI.fa(i+1)}</td><td>${UI.esc(p.id)}</td><td>${UI.fa(p.s.played)}</td><td>${UI.fa(p.s.wins)}</td><td>${UI.fa(p.s.points)}</td></tr>`).join('')}</table></div><p class="muted" style="font-size:.85rem;margin-top:8px">برای دیدن سابقه روی نام بازیکن بزنید.</p>`:'<p class="muted">هنوز بازیکنی ثبت نشده است.</p>'}
 <div class="row" style="margin-top:16px"><button class="btn" id="b">بازگشت</button></div></div>`;
 UI.$('#b').onclick=()=>IntroScreen.render();
 document.querySelectorAll('tr.go').forEach(r=>r.onclick=()=>this.detail(r.dataset.id));UI.show('players')},
 detail(id){const p=Store.load().players[id],s=Store.stats(p),R={w:'برد',l:'باخت',d:'مساوی'};
  UI.$('#players').innerHTML=`<div class="card"><div class="row"><span class="avatar">${UI.esc(p.first[0])}</span><div><h2>${UI.esc(p.id)}</h2><div class="muted" style="font-size:.85rem">عضو از ${p.created}</div></div></div>
  <div class="stats">${[['بازی',s.played],['برد',s.wins],['مساوی',s.draws],['باخت',s.losses],['مجموع امتیاز',s.points],['بیشترین امتیاز',s.best]].map(x=>`<div class="stat"><b>${UI.fa(x[1])}</b><small>${x[0]}</small></div>`).join('')}</div>
  <h3 style="margin-bottom:8px">سابقه بازی‌ها</h3>${p.games.length?`<div style="overflow-x:auto"><table><tr><th>تاریخ</th><th>حریف</th><th>امتیاز</th><th>نتیجه</th><th>دسته</th></tr>
  ${p.games.map(g=>`<tr><td>${g.date}<br><small class="muted">${g.time}</small></td><td>${UI.esc(g.opp)}</td><td>${UI.fa(g.my)} - ${UI.fa(g.their)}</td><td><span class="res ${g.res}">${R[g.res]}</span></td><td>${g.cat}</td></tr>`).join('')}</table></div>`:'<p class="muted">هنوز بازی‌ای انجام نشده.</p>'}
  <div class="row" style="margin-top:16px"><button class="btn" id="b">بازگشت به لیست</button></div></div>`;
  UI.$('#b').onclick=()=>this.render()}};
