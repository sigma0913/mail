// program.js – ぐー数分解（小数入力対応・連続足し算圧縮・冗長括弧削減・1〜50 COUNT_EXPR）
// ============================================================================
// 2025‑07‑01
//   • 小数 ⇒ 10000^n を掛け整数化 → 分解 → 10000^n で割り戻す
//   • 3 項以上の連続加算を掛け算に圧縮（ネスト対応）
//   • 1〜50 の COUNT_EXPR 完備
//   • 分数/素の整数 → COUNT_EXPR 置換の再発バグ修正（誤差許容）
//   • stripRedundantParens で大量の無駄括弧を除去
//   • UI は 0.1 s ごと自動計算
// ============================================================================

/******************* 1. プリミティブ定義 & 定数 *******************/
const SMALLER_PRIMITIVES      = [47, 33, 31, 19, 7, 5, 1, 0.75];
const EXP_LIMIT               = 6;
const VALUE_ABS_MAX           = 1_000_000;
const NODE_EXPANSION_LIMIT    = 25_000;
const BASE_VAL                = 10_000;
const BASE_EXPR               = '((5*(1+1))^(5-1))'; // =10000

/******************* 2. 1〜50 のぐー数表現 *******************/
const COUNT_EXPR = {
   1:'1',              2:'1+1',
   3:'5-1-1',          4:'5-1',          5:'5',           6:'5+1',
   7:'7',              8:'7+1',
   9:'(19-1)/(1+1)',  10:'(19+1)/(1+1)',
  11:'19-7-1',        12:'19-7',        13:'19-5-1',     14:'19-5',
  15:'19-5+1',        16:'19-5+1+1',    17:'19-1-1',     18:'19-1',
  19:'19',            20:'19+1',
  21:'19+1+1',        22:'19+5-1-1',    23:'19+5-1',     24:'19+5',
  25:'19+5+1',        26:'19+7',        27:'19+7+1',     28:'19+7+1+1',
  29:'31-1-1',        30:'31-1',        31:'31',         32:'31+1',
  33:'33',            34:'33+1',        35:'33+1+1',     36:'33+5-1-1',
  37:'33+5-1',        38:'33+5',        39:'33+5+1',     40:'33+7',
  41:'33+7+1',        42:'47-5',        43:'47-5+1',     44:'47-5+1+1',
  45:'47-1-1',        46:'47-1',        47:'47',         48:'47+1',
  49:'47+1+1',        50:'47+5-1-1'
};

/******************* 3. ブロック近似テーブル（高速化用） *******************/
const THOUSANDS_BLOCK = {
  1:{val:31*33,        expr:'31*33'},
  2:{val:31*47+519,    expr:'31*47+519'},
  3:{val:33*47+1381,   expr:'33*47+1381'},
  4:{val:47*(47+33+5), expr:'47*(47+33+5)'},
  5:{val:5040,         expr:'7!'},
  6:{val:5040+821,     expr:'7!+821'},
  7:{val:33*206+519,   expr:'33*206+519'},
  8:{val:33*206+1381,  expr:'33*206+1381'},
  9:{val:5040+4137,    expr:'7!+4137'},
};
const HUNDREDS_BLOCK = {
  1:{val:100, expr:'19*5'},
  2:{val:200, expr:'(47-5)*5'},
  3:{val:300, expr:'206+47+47'},
  4:{val:400, expr:'206+206'},
  5:{val:500, expr:'519'},
};

/******************* 4. ユーティリティ *******************/
function factorial(n){
  if(!Number.isInteger(n)||n<0||n>10) return NaN;
  let r=1;for(let i=2;i<=n;i++)r*=i;return r;
}
const isExactDiv    =(a,b)=>b!==0&&a%b===0;
const better        =(n,p)=>p===undefined||n<p;

/******************* 5. ヒープ ***************************/
class MinHeap{
  constructor(){this.a=[];}
  push(x){this.a.push(x);this.#up(this.a.length-1);}
  pop(){
    if(!this.a.length) return null;
    const t=this.a[0],e=this.a.pop();
    if(this.a.length){this.a[0]=e;this.#down(0);}
    return t;
  }
  #up(i){while(i){const p=(i-1)>>1;if(this.a[i].cost>=this.a[p].cost)break;[this.a[i],this.a[p]]=[this.a[p],this.a[i]];i=p;}}
  #down(i){const n=this.a.length;for(;;){let l=2*i+1,r=2*i+2,s=i;
    if(l<n&&this.a[l].cost<this.a[s].cost)s=l;
    if(r<n&&this.a[r].cost<this.a[s].cost)s=r;
    if(s===i)break;[this.a[i],this.a[s]]=[this.a[s],this.a[i]];i=s;}}
  get size(){return this.a.length;}
}

/******************* 6. 最小項数 BFS *******************/
function bfsDecompose(target,prims){
  if(target===0) return '0';
  if(COUNT_EXPR[target]) return COUNT_EXPR[target]; // 直命中
  const pList=prims.filter(x=>x<=47||x===0.75);
  const baseMap=new Map(),h=new MinHeap();
  [...pList.filter(x=>x!==0.75)].sort((a,b)=>b-a).concat([0.75])
    .forEach(p=>{baseMap.set(p,{e:p.toString(),c:1});h.push({value:p,expr:p.toString(),cost:1});});
  let exp=0;
  while(h.size&&exp<NODE_EXPANSION_LIMIT){
    const a=h.pop();exp++;
    for(const [bv,bo] of baseMap){
      const bc=bo.c,be=bo.e,nc=a.cost+bc;
      const make=(v,e,c)=>{
        if(!Number.isFinite(v)||Math.abs(v)>VALUE_ABS_MAX) return false;
        if(better(c,baseMap.get(v)?.c)){baseMap.set(v,{e,c});h.push({value:v,expr:e,cost:c});if(v===target)return true;}
        return false;
      };
      if(make(a.value+bv,`(${a.expr}+${be})`,nc)) return baseMap.get(target).e;
      if(make(a.value-bv,`(${a.expr}-${be})`,nc)) return baseMap.get(target).e;
      if(make(bv-a.value,`(${be}-${a.expr})`,nc)) return baseMap.get(target).e;
      if(make(a.value*bv,`(${a.expr}*${be})`,nc)) return baseMap.get(target).e;
      if(isExactDiv(a.value,bv)&&make(a.value/bv,`(${a.expr}/${be})`,nc)) return baseMap.get(target).e;
      if(isExactDiv(bv,a.value)&&make(bv/a.value,`(${be}/${a.expr})`,nc)) return baseMap.get(target).e;
      if(Number.isInteger(bv)&&Math.abs(bv)<=EXP_LIMIT&&Math.abs(a.value)<=50){
        if(make(Math.pow(a.value,bv),`(${a.expr}^${be})`,nc)) return baseMap.get(target).e;
      }
      if(Number.isInteger(a.value)&&Math.abs(a.value)<=EXP_LIMIT&&Math.abs(bv)<=50){
        if(make(Math.pow(bv,a.value),`(${be}^${a.expr})`,nc)) return baseMap.get(target).e;
      }
    }
    if(Number.isInteger(a.value)&&a.value>=0&&a.value<=10){
      const f=factorial(a.value);
      if(!Number.isNaN(f)&&better(a.cost,baseMap.get(f)?.c)){
        const ex=`(${a.expr}!)`;baseMap.set(f,{e:ex,c:a.cost});h.push({value:f,expr:ex,cost:a.cost});if(f===target)return ex;
      }
    }
  }
  return baseMap.get(target)?.e??null;
}

/******************* 7. チャンク分解（1000単位） *******************/
function decomposeChunk(n){
  if(n===0) return {val:0,expr:'0'};
  if(n<1000) return {val:n,expr:bfsDecompose(n,SMALLER_PRIMITIVES)??n.toString()};
  const k=Math.floor(n/1000),b=THOUSANDS_BLOCK[k];
  if(!b) return {val:n,expr:bfsDecompose(n,SMALLER_PRIMITIVES)??n.toString()};
  let val=b.val,expr=b.expr,delta=n-val;
  if(Math.abs(delta)>200){
    const sKey=Math.round(delta/100),sBlk=HUNDREDS_BLOCK[sKey];
    if(sBlk){expr=`(${expr} ${delta>0?'+':'-'} ${sBlk.expr})`;val+=delta>0?sBlk.val:-sBlk.val;delta=n-val;}
  }
  if(delta){
    const adj=bfsDecompose(Math.abs(delta),SMALLER_PRIMITIVES);
    if(!adj) return {val:n,expr:bfsDecompose(n,SMALLER_PRIMITIVES)??n.toString()};
    expr=`(${expr}${delta>0?'+':'-'}${adj})`;val+=delta;
  }
  return {val,expr};
}

/******************* 8. 式中の冗長括弧除去ユーティリティ *******************/
function stripRedundantParens(str){
  // 1) 二重括弧 → 一重
  while(/\(\(([^()]+)\)\)/.test(str)) str=str.replace(/\(\(([^()]+)\)\)/g,'($1)');
  // 2) 単項・数値の括弧除去
  str=str.replace(/\((\d+)\)/g,'$1');
  // 3) 外側丸ごと括弧を安全に剥がす
  const balanced=s=>{
    let d=0;for(const ch of s){if(ch==='(')d++; else if(ch===')'){d--; if(d<0) return false;}}return d===0;
  };
  while(/^\((.*)\)$/.test(str)&&balanced(str.slice(1,-1))) str=str.slice(1,-1);
  return str;
}

/******************* 9. 連続足し算→掛け算 & COUNT_EXPR 置換 *******************/
function compressRepeatedAdds(expr){
  const recur=s=>{
    let out='',i=0;
    while(i<s.length){
      if(s[i]==='('){
        let d=0,start=i;
        while(i<s.length){if(s[i]==='(')d++; else if(s[i]===')'){d--; if(d===0)break;} i++;}
        const inner=s.slice(start+1,i);
        out+=`(${tryCompress(recur(inner))})`; i++;
      }else{out+=s[i++];}
    }
    return tryCompress(out);
  };

  function tryCompress(str){
    // ① 連続同項加算 → 掛け算
    str=str.replace(/\(([^()]+)\)/g,(m,content)=>{
      const parts=content.split('+').map(t=>t.trim());
      if(parts.length<3) return m;
      if(parts.every(p=>p===parts[0])){
        const mul=COUNT_EXPR[parts.length]??parts.length.toString();
        return `(${parts[0]}*${mul})`;
      }
      return m;
    });

    // ② 分数 → COUNT_EXPR （誤差許容）
    str=str.replace(/\(([^()]+)\/([^()]+)\)/g,(m,num,den)=>{
      try{
        const val=eval(num)/eval(den),r=Math.round(val);
        if(Math.abs(val-r)<1e-9 && COUNT_EXPR[r]) return `(${COUNT_EXPR[r]})`;
      }catch{}
      return m;
    });

    // ③ 素の整数 → COUNT_EXPR
    str=str.replace(/\b\d+\b/g, m=>COUNT_EXPR[m]??m);

    return stripRedundantParens(str);
  }

  return recur(expr);
}

/******************* 10. 再帰分解（整数） *******************/
function decomposeLarge(num){
  if(num<BASE_VAL) return compressRepeatedAdds(decomposeChunk(num).expr);
  const lower=num%BASE_VAL,higher=Math.floor(num/BASE_VAL);
  let ex='';
  if(higher) ex=`(${decomposeLarge(higher)}*${BASE_EXPR})`;
  if(lower)  ex=ex?`${ex}+${decomposeChunk(lower).expr}`:decomposeChunk(lower).expr;
  return compressRepeatedAdds(ex)||'0';
}

/******************* 11. 小数入力ラッパ ************************/
function decomposeDecimal(num){
  if(Number.isInteger(num)) return decomposeLarge(num);
  let n=0,temp=num;
  while(!Number.isInteger(temp)&&n<10){temp*=BASE_VAL;n++;}
  if(!Number.isInteger(temp)) return '小数の精度が高すぎて分解できません。';
  const decomp=decomposeLarge(Math.round(temp));
  if(!decomp) return null;
  const div=n?`/${BASE_EXPR}${n>1?`^${n}`:''}`:'';
  return `${decomp}${div}`;
}

/******************* 12. UI バインディング（リアルタイム変換） *******************/
window.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('input');
  const output=document.getElementById('output');
  const write=m=>output.textContent=m;

  let last='';
  setInterval(()=>{
    const v=input.value.trim();
    if(v===last) return; last=v;

    if(!v){write('');return;}
    const num=Number(v);
    if(Number.isNaN(num)){write('数値を入力してください。');return;}

    write('計算中…');
    setTimeout(()=>{
      const res=decomposeDecimal(num);
      write(res?`${v} = ${res}`:'分解に失敗しました。');
    },15);
  },100);
});
