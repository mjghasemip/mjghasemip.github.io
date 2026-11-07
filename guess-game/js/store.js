const Store={
 k:'hads-bezan-v2',
 blank(){return{players:{},history:[],last:{},session:[null,null]}},
 load(){try{return Object.assign(this.blank(),JSON.parse(localStorage.getItem(this.k))||{})}catch(e){return this.blank()}},
 save(d){try{localStorage.setItem(this.k,JSON.stringify(d))}catch(e){}},
 pid(f,l){return (f+' '+l).trim().replace(/\s+/g,' ')},
 login(f,l){const d=this.load(),id=this.pid(f,l);
  if(!d.players[id])d.players[id]={id,first:f.trim(),last:l.trim(),created:Jalali.format(),games:[]};
  this.save(d);return d.players[id]},
 setSession(ids){const d=this.load();d.session=ids;this.save(d)},
 getSession(){const d=this.load();return d.session.map(id=>d.players[id]||null)},
 setLast(o){const d=this.load();d.last=o;this.save(d)},
 recordGame(g){const d=this.load();d.history.unshift(g);d.history=d.history.slice(0,100);
  [0,1].forEach(i=>{const p=d.players[g.ids[i]];if(!p)return;
   p.games.unshift({date:g.date,time:g.time,cat:g.cat,opp:g.names[1-i],my:g.scores[i],their:g.scores[1-i],
    res:g.winner<0?'d':(g.winner===i?'w':'l'),rounds:g.rounds});p.games=p.games.slice(0,200)});
  this.save(d)},
 stats(p){const g=p.games,w=g.filter(x=>x.res==='w').length,dr=g.filter(x=>x.res==='d').length;
  return{played:g.length,wins:w,draws:dr,losses:g.length-w-dr,points:g.reduce((a,x)=>a+x.my,0),best:g.reduce((a,x)=>Math.max(a,x.my),0)}},
 list(){const d=this.load();return Object.values(d.players).map(p=>Object.assign({s:this.stats(p)},p)).sort((a,b)=>b.s.wins-a.s.wins||b.s.points-a.s.points)},
 clearHistory(){const d=this.load();d.history=[];Object.values(d.players).forEach(p=>p.games=[]);this.save(d)}
};
