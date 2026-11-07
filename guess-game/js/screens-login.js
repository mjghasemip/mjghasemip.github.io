const LoginScreen={render(){
 const ses=Store.getSession(),saved=Store.list();
 const slot=(i,p)=>`<div class="slot s${i+1}"><h3><span class="avatar" id="av${i}">${p?UI.esc(p.first[0]):'؟'}</span>${i?'بازیکن دوم':'بازیکن اول'}</h3>
  <div class="names"><div class="field"><label>نام</label><input type="text" id="f${i}" maxlength="16" value="${p?UI.esc(p.first):''}" autocomplete="off"></div>
  <div class="field"><label>نام خانوادگی</label><input type="text" id="l${i}" maxlength="20" value="${p?UI.esc(p.last):''}" autocomplete="off"></div></div>
  ${saved.length?`<div class="muted" style="font-size:.8rem">بازیکنان قبلی:</div><div class="saved" id="sv${i}">${saved.map(x=>`<div class="chip" data-i="${UI.esc(x.id)}">${UI.esc(x.id)}</div>`).join('')}</div>`:''}</div>`;
 UI.$('#login').innerHTML=`<div class="card"><h2>ورود بازیکنان</h2><p class="muted">برای ثبت سابقه، هر دو بازیکن با نام و نام خانوادگی وارد شوند.</p>
  <div class="vs">${slot(0,ses[0])}<div class="vsmark">VS</div>${slot(1,ses[1])}</div><div class="err" id="err"></div>
  <div class="row center"><button class="btn primary lg" id="ok">ورود و ادامه</button><button class="btn" id="back">بازگشت</button></div></div>`;
 const d=Store.load();
 [0,1].forEach(i=>{
  const upd=()=>{UI.$('#av'+i).textContent=(UI.$('#f'+i).value.trim()[0])||'؟'};UI.$('#f'+i).oninput=upd;
  document.querySelectorAll('#sv'+i+' .chip').forEach(c=>c.onclick=()=>{const p=d.players[c.dataset.i];UI.$('#f'+i).value=p.first;UI.$('#l'+i).value=p.last;upd()})});
 UI.$('#back').onclick=()=>IntroScreen.render();
 UI.$('#ok').onclick=()=>{const v=i=>[UI.$('#f'+i).value.trim(),UI.$('#l'+i).value.trim()],a=v(0),b=v(1),err=UI.$('#err');
  if([...a,...b].some(x=>x.length<2)){err.textContent='نام و نام خانوادگی هر دو بازیکن (حداقل ۲ حرف) لازم است.';return}
  if(Store.pid(...a)===Store.pid(...b)){err.textContent='دو بازیکن نمی‌توانند یک نفر باشند.';return}
  const p1=Store.login(...a),p2=Store.login(...b);Store.setSession([p1.id,p2.id]);UI.toast('خوش آمدید '+p1.first+' و '+p2.first);SetupScreen.render()};
 UI.show('login')}};
