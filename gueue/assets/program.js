// ver 0.2.0
// program.js – Gueue Number 分解（段階近似・1～100表現・括弧最適化）
// =============================================================

/******************* 1. プリミティブ定義 *******************/
const SMALLER_PRIMITIVES = [47, 33, 31, 19, 7, 5, 1, 0.75];

const EXP_LIMIT = 6;
const VALUE_ABS_MAX = 1e256;  // 非常に大きな値に変更
const NODE_EXPANSION_LIMIT = 25000;
const BASE_VAL = 10000;
const BASE_EXPR = '((5*(1+1))^(5-1))';

/******************* 2. 1〜100 の gueue number 表現 *******************/
const COUNT_EXPR = {
0: '(1-1)',

1: '1',
2: '(1+1)',
3: '(0.75*(5-1))',
4: '(5-1)',
5: '5',

6: '(1+5)',
7: '7',
8: '(1+7)',
9: '(0.75*(5+7))',
10: '(5+5)',

11: '(1+(5+5))',
12: '(5+7)',
13: '(1+(5+7))',
14: '(19-5)',
15: '(0.75*(1+19))',

16: '(47-31)',
17: '((19-1)-1)',
18: '(19-1)',
19: '19',
20: '(1+19)',

21: '(0.75*(33-5))',
22: '(47-(55))',
23: '((5+19)-1)',
24: '(5+19)',
25: '(55)',

26: '(31-5)',
27: '(0.75*(5+31))',
28: '(33-5)',
29: '((31-1)-1)',
30: '(31-1)',

31: '31',
32: '(1+31)',
33: '33',
34: '(1+33)',
35: '(5*7)',

36: '(5+31)',
37: '(1+(5+31))',
38: '(5+33)',
39: '(0.75*(5+47))',
40: '(7+33)',

41: '((47-5)-1)',
42: '(47-5)',
43: '((33/0.75)-1)',
44: '(33/0.75)',
45: '(1+(33/0.75))',

46: '(47-1)',
47: '47',
48: '(1+47)',
49: '(7*7)',
50: '(19+31)',

51: '((5+47)-1)',
52: '(5+47)',
53: '(1+(5+47))',
54: '(7+47)',
55: '(1+(7+47))',

56: '((47-5)/0.75)',
57: '(5+(5+47))',
58: '(33+(55))',
59: '(5+(7+47))',
60: '(0.75(33+47))',

61: '((31+31)-1)',
62: '(31+31)',
63: '(1+(31+31))',
64: '(31+33)',
65: '((19+47)-1)',

66: '(19+47)',
67: '(1+(19+47))',
68: '(19+(77))',
69: '(5+(31+33))',
70: '(5(19-5))',

71: '(5+(19+47))',
72: '((7+47)/0.75)',
73: '((31+47)-5)',
74: '((33/0.75)-(1-31))',
75: '((33+47)-5)',

76: '(19*(5-1))',
77: '((31+47)-1)',
78: '(31+47)',
79: '(1+(31+47))',
80: '(33+47)',

81: '(1+(33+47))',
82: '(33+(77))',
83: '(5+(31+47))',
84: '(7(5+7))',
85: '(5+(33+47))',

86: '((719)-47)',
87: '(7+(33+47))',
88: '((19+47)/0.75)',
89: '((47+47)-5)',
90: '(0.75(5)!)',

91: '(47+(33/0.75))',
92: '((33/0.75)+(1+47))',
93: '((47+47)-1)',
94: '(47+47)',
95: '(5*19)',

96: '(1+(519))',
97: '(19+(31+47))',
98: '(7(19-5))',
99: '(5+(47+47))',
100: '(5*(1+19))'


};

/******************* 3. ブロック定義 *******************/
const THOUSANDS_BLOCK = {
  1: { val: 31*33, expr: '31*33' },
  2: { val: 31*47+519, expr: '31*47+519' },
  3: { val: 33*47+1381, expr: '33*47+1381' },
  4: { val: 47*(47+33+5), expr: '47*(47+33+5)' },
  5: { val: 5040, expr: '7!' },
  6: { val: 5040+821, expr: '7!+821' },
  7: { val: 33*206+519, expr: '33*206+519' },
  8: { val: 33*206+1381, expr: '33*206+1381' },
  9: { val: 5040+4137, expr: '7!+4137' },
};

const HUNDREDS_BLOCK = {
  1: { val: 95, expr: '19*5' },
  2: { val: 210, expr: '(47-5)*5' },
  3: { val: 300, expr: '206+47+47' },
  4: { val: 412, expr: '206+206' },
  5: { val: 519, expr: '519' },
  6: { val:693, expr:'33*(19+1+1)' },
  7: { val: 700, expr: '33*(19+1+1)' },       // 693 なので誤差7は調整が必要
  8: { val: 800, expr: '33*(19+5)' },         // 792 なので誤差8は調整が必要
  9: { val: 900, expr: '33*(19+7)+47' },      // 905 なので誤差-5は調整が必要
  10: { val: 1000, expr: '31*33' },            // 1023 なので誤差-23は調整が必要
};

/******************* 4. 補助関数 *******************/
function factorial(n){
  if (!Number.isInteger(n) || n < 0 || n > 10) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
const isExactDiv = (a, b) => b !== 0 && a % b === 0;
const better = (n, p) => p === undefined || n < p;

/******************* 5. 最小項数 BFS *******************/
class MinHeap {
  constructor() { this.a = []; }
  push(n) { this.a.push(n); this.#u(this.a.length - 1); }
  pop() {
    if (!this.a.length) return null;
    const t = this.a[0];
    const e = this.a.pop();
    if (this.a.length) {
      this.a[0] = e;
      this.#d(0);
    }
    return t;
  }
  #u(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[i].cost >= this.a[p].cost) break;
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }
  #d(i) {
    const n = this.a.length;
    while (true) {
      let l = i * 2 + 1, r = i * 2 + 2, s = i;
      if (l < n && this.a[l].cost < this.a[s].cost) s = l;
      if (r < n && this.a[r].cost < this.a[s].cost) s = r;
      if (s === i) break;
      [this.a[i], this.a[s]] = [this.a[s], this.a[i]];
      i = s;
    }
  }
  get size() { return this.a.length; }
}

function bfsDecompose(target, prims) {
  if (target === 0) return '0';
  const pList = prims.filter(x => x <= 47 || x === 0.75);
  const baseMap = new Map();
  const h = new MinHeap();
  const sorted = [...pList.filter(x => x !== 0.75)].sort((a, b) => b - a);
  sorted.push(0.75);
  for (const p of sorted) {
    baseMap.set(p, { e: p.toString(), c: 1 });
    h.push({ value: p, expr: p.toString(), cost: 1 });
    if (p === target) return p.toString();
  }

  let exp = 0;
  while (h.size && exp < NODE_EXPANSION_LIMIT) {
    const a = h.pop(); exp++;
    for (const [bv, bo] of baseMap) {
      const bc = bo.c, be = bo.e;
      const nc = a.cost + bc;
      const make = (v, e, c) => {
        if (!Number.isFinite(v) || Math.abs(v) > VALUE_ABS_MAX) return false;
        if (better(c, baseMap.get(v)?.c)) {
          baseMap.set(v, { e, c });
          h.push({ value: v, expr: e, cost: c });
          if (v === target) return true;
        }
        return false;
      };
      if (make(a.value + bv, `(${a.expr}+${be})`, nc)) return baseMap.get(target).e;
      if (make(a.value - bv, `(${a.expr}-${be})`, nc)) return baseMap.get(target).e;
      if (make(bv - a.value, `(${be}-${a.expr})`, nc)) return baseMap.get(target).e;
      if (make(a.value * bv, `(${a.expr}*${be})`, nc)) return baseMap.get(target).e;
      if (isExactDiv(a.value, bv) && make(a.value / bv, `(${a.expr}/${be})`, nc)) return baseMap.get(target).e;
      if (isExactDiv(bv, a.value) && make(bv / a.value, `(${be}/${a.expr})`, nc)) return baseMap.get(target).e;
      if (Number.isInteger(bv) && Math.abs(bv) <= EXP_LIMIT && Math.abs(a.value) <= 50) {
        const p = Math.pow(a.value, bv);
        if (make(p, `(${a.expr}^${be})`, nc)) return baseMap.get(target).e;
      }
      if (Number.isInteger(a.value) && Math.abs(a.value) <= EXP_LIMIT && Math.abs(bv) <= 50) {
        const p = Math.pow(bv, a.value);
        if (make(p, `(${be}^${a.expr})`, nc)) return baseMap.get(target).e;
      }
    }

    if (Number.isInteger(a.value) && a.value >= 0 && a.value <= 10) {
      const f = factorial(a.value);
      if (!Number.isNaN(f) && better(a.cost, baseMap.get(f)?.c)) {
        const ex = `(${a.expr}!)`;
        baseMap.set(f, { e: ex, c: a.cost });
        h.push({ value: f, expr: ex, cost: a.cost });
        if (f === target) return ex;
      }
    }
  }

  return null;
}

/******************* 6. チャンク分解 *******************/
function decomposeChunk(n) {
  if (n === 0) return { val: 0, expr: '0' };
  if (n <= 100 && COUNT_EXPR[n]) return { val: n, expr: COUNT_EXPR[n] };
  if (n < 100) return { val: n, expr: bfsDecompose(n, SMALLER_PRIMITIVES) ?? n.toString() };

  let val = 0;
  const exprParts = [];

  const k1000 = Math.floor(n / 1000);
  const tBlk = THOUSANDS_BLOCK[k1000];
  if (tBlk) {
    val += tBlk.val;
    exprParts.push(tBlk.expr);
  }

  const remain1 = n - val;
  const k100 = Math.round(remain1 / 100);
  const hBlk = HUNDREDS_BLOCK[Math.abs(k100)];
  if (hBlk) {
    const isPositive = remain1 >= 0;
    val += isPositive ? hBlk.val : -hBlk.val;
    exprParts.push(isPositive ? hBlk.expr : `-${hBlk.expr}`);
  }

  const remain2 = n - val;
  if (remain2 !== 0) {
    const adj = remain2 > 0
      ? (COUNT_EXPR[remain2] ?? bfsDecompose(remain2, SMALLER_PRIMITIVES))
      : (COUNT_EXPR[-remain2] ?? bfsDecompose(-remain2, SMALLER_PRIMITIVES));
    if (!adj) return { val: n, expr: bfsDecompose(n, SMALLER_PRIMITIVES) ?? n.toString() };

    // 連続した「+」を避けるため調整
    const sign = remain2 > 0 ? '+' : '-';
    const adjExpr = adj.startsWith('+') || adj.startsWith('-') ? adj.slice(1) : adj;
    exprParts.push(sign + adjExpr);
    val = n;
  }

  return { val, expr: '(' + exprParts.join('+') + ')' };
}

/******************* 7. ネスト対応 連続足し算 -> 掛け算 圧縮 *******************/
function compressRepeatedAdds(expr) {
  const recur = (s) => {
    let out = '', i = 0;
    while (i < s.length) {
      if (s[i] === '(') {
        let depth = 0, start = i;
        while (i < s.length) {
          if (s[i] === '(') depth++;
          else if (s[i] === ')') {
            depth--;
            if (depth === 0) break;
          }
          i++;
        }
        const inner = s.slice(start + 1, i);
        const compressedInner = recur(inner);
        const compressedWrapped = tryCompress(compressedInner);
        out += `(${compressedWrapped})`;
        i++;
      } else {
        out += s[i];
        i++;
      }
    }
    return tryCompress(out);
  };

  function tryCompress(str) {
    // ① 連続加算の検出と圧縮
    str = str.replace(/\(([^()]+)\)/g, (match, content) => {
      const parts = content.split('+').map(t => t.trim());
      if (parts.length < 3) return match;
      const first = parts[0];
      if (parts.every(p => p === first)) {
        const mulExpr = COUNT_EXPR[parts.length] ?? parts.length.toString();
        return `(${first}*${mulExpr})`;
      }
      return match;
    });

    // ② COUNT_EXPR と一致する除算の変換
    str = str.replace(/\(([^()]+)\/([^()]+)\)/g, (match, numer, denom) => {
      try {
        const val = eval(numer) / eval(denom);
        const replacement = COUNT_EXPR[Math.round(val)];
        return replacement ? `(${replacement})` : match;
      } catch (e) {
        return match;
      }
    });

    return str;
  }

  return recur(expr);
}

/******************* 8. 再帰分解 *******************/
function normalizePluses(expr) {
  // 「+」が連続してたら1個にまとめる（例: "+++" → "+"）
  return expr.replace(/\++/g, '+');
}

function decomposeLarge(num) {
  if (num === 0) return '1-1';
  if (Math.abs(num) < BASE_VAL) {
    const res = compressRepeatedAdds(decomposeChunk(num).expr);
    return normalizePluses(res);
  }

  const absNum = Math.abs(num);
  const lower = absNum % BASE_VAL;
  const higher = Math.floor(absNum / BASE_VAL);
  const hExpr = decomposeLarge(higher);
  const lObj = decomposeChunk(lower);
  let ex = '';
  if (higher !== 0) ex = `(${hExpr}*${BASE_EXPR})`;
  if (lower !== 0) ex = ex ? `${ex}+${lObj.expr}` : lObj.expr;
  if (num < 0) ex = `-(${ex})`;

  ex = normalizePluses(ex);

  return ex;
}

/******************* 9. UI バインディング *******************/
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const write = m => output.textContent = m;

  let lastValue = '';

  function tryUpdate() {
    const currentValue = input.value.trim();
    if (currentValue === lastValue) return; // 変化なし

    lastValue = currentValue;
    const n = Number(currentValue);
    if (isNaN(n)) {
      write('数値を入力してください。');
      return;
    }
    if (Math.abs(n) > VALUE_ABS_MAX) {
      write('入力値が大きすぎます。');
      return;
    }

    const scaledExpr = (() => {
      const isNegative = n < 0;
      let scale = 0;
      let scaled = Math.abs(n);  // ← 絶対値を取る

      while (!Number.isInteger(scaled) && scale < 10) {
        scaled *= BASE_VAL;
        scale++;
      }

      const expr = decomposeLarge(scaled);
      const scaledDown = scale > 0
        ? `(${expr}/${BASE_EXPR.repeat(scale).split('').join('')})`
        : expr;

      return isNegative ? `-(${scaledDown})` : scaledDown;
    })();

    write(`${n} = ${scaledExpr}`);
  }

  setInterval(tryUpdate, 100);  // ← ここが100ms間隔での実行
});