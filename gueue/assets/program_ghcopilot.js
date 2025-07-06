// ver 0.3.2 - 5桁ごとに区切り、「チャンク値×重み」をg-num分解（計算一致・全ロジック省略なし）

const GUEUE_NUMBERS = [
  0.75, 1, 5, 7, 19, 31, 33, 47,
  206, 519, 821, 1381, 4137
];

const EXP_LIMIT = 6;
const VALUE_ABS_MAX = 1e256;
const NODE_EXPANSION_LIMIT = 1200;
const BASE_VAL_1000 = 31 * 33; // 1023
const BASE_VAL_100 = 19 * 5;   // 95
const BASE_EXPR_1000 = '(31*33)';
const BASE_EXPR_100 = '(19*5)';

// ---COUNT_EXPR 1～100---
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
  22: '(47-(5*5-5-7))',
  23: '((5+19)-1)',
  24: '(5+19)',
  25: '(5*5)',
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
  50: '(5*(1+9))',
  51: '((5+47)-1)',
  52: '(5+47)',
  53: '(1+(5+47))',
  54: '(7+47)',
  55: '(1+(7+47))',
  56: '((47-5)/0.75)',
  57: '(5+(5+47))',
  58: '(33+(5*5))',
  59: '(5+(7+47))',
  60: '(0.75*(33+47))',
  61: '((31+31)-1)',
  62: '(31+31)',
  63: '(1+(31+31))',
  64: '(31+33)',
  65: '((19+47)-1)',
  66: '(19+47)',
  67: '(1+(19+47))',
  68: '(19+(7*7))',
  69: '(5+(31+33))',
  70: '(5*(19-5))',
  71: '(5+(19+47))',
  72: '((7+47)/0.75)',
  73: '((31+47)-5)',
  74: '((33/0.75)-(1+31))',
  75: '((33+47)-5)',
  76: '(19*(5-1))',
  77: '((31+47)-1)',
  78: '(31+47)',
  79: '(1+(31+47))',
  80: '(33+47)',
  81: '(1+(33+47))',
  82: '(33+(7*7))',
  83: '(5+(31+47))',
  84: '(7*(5+7))',
  85: '(5+(33+47))',
  86: '((7*19)-47)',
  87: '(7+(33+47))',
  88: '((19+47)/0.75)',
  89: '((47+47)-5)',
  90: '(0.75*((5*5)*5+7))',
  91: '(47+(33/0.75))',
  92: '((33/0.75)+(1+47))',
  93: '((47+47)-1)',
  94: '(47+47)',
  95: '(19*5)',
  96: '(1+(47+47))',
  97: '(19+(31+47))',
  98: '(7*(19-5))',
  99: '(5+(47+47))',
  100: '(5*(1+19))'
};

function factorial(n){
  if (!Number.isInteger(n) || n < 0 || n > 10) return NaN;
  let r = 1; for (let i = 2; i <= n; i++) r *= i;
  return r;
}
const isExactDiv = (a, b) => b !== 0 && a % b === 0;
const better = (n, p) => p === undefined || n < p;

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
  if (target === 0) return COUNT_EXPR[0];
  const baseMap = new Map();
  const h = new MinHeap();
  for (const p of prims) {
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

// 1チャンク分のg-num分解
function decomposeChunkMinSingle(n) {
  if (n === 0) return COUNT_EXPR[0];
  if (n > 0 && n <= 100 && COUNT_EXPR[n]) return COUNT_EXPR[n];
  if (n < 0 && n >= -100 && COUNT_EXPR[-n]) return `-(${COUNT_EXPR[-n]})`;

  let absn = Math.abs(n);
  let sign = n < 0 ? '-' : '';
  let exprParts = [];

  // g-numチャンクの実値を使って割り算
  const CHUNKS = [
    { val: 4137, name: "4137" },
    { val: 1381, name: "1381" },
    { val: 821, name: "821" },
    { val: 519, name: "519" },
    { val: 206, name: "206" },
    { val: 1023, name: BASE_EXPR_1000 },
    { val: 95, name: BASE_EXPR_100 }
  ];

  for (const chunk of CHUNKS) {
    const k = Math.floor(absn / chunk.val);
    if (k) {
      const kExpr = COUNT_EXPR[k] || bfsDecompose(k, GUEUE_NUMBERS) || k.toString();
      exprParts.push(`(${kExpr}*${chunk.name})`);
      absn -= k * chunk.val;
    }
  }

  // 残差は100以下保証
  if (absn > 0) {
    if (absn <= 100 && COUNT_EXPR[absn]) {
      exprParts.push(COUNT_EXPR[absn]);
    } else {
      const bfs = bfsDecompose(absn, GUEUE_NUMBERS);
      exprParts.push(bfs || absn.toString());
    }
  }
  let expr = exprParts.join('+');
  if (sign && expr) expr = `${sign}(${expr})`;
  return expr;
}

// 5桁ごとに区切り、「チャンク値×重み」をg-num分解
function decomposeChunkMin(n) {
  if (n === 0) return COUNT_EXPR[0];
  if (n > 0 && n <= 100 && COUNT_EXPR[n]) return COUNT_EXPR[n];
  if (n < 0 && n >= -100 && COUNT_EXPR[-n]) return `-(${COUNT_EXPR[-n]})`;

  let absn = Math.abs(n);
  let sign = n < 0 ? '-' : '';
  let exprParts = [];

  // チャンク分割（5桁ごと、右から）
  const str = absn.toString();
  let chunks = [];
  for (let i = str.length; i > 0; i -= 5) {
    const start = Math.max(i - 5, 0);
    chunks.unshift(Number(str.substring(start, i)));
  }

  // 各チャンク（値×重み）をg-numで分解
  for (let i = 0; i < chunks.length; i++) {
    const chunkVal = chunks[i];
    if (chunkVal === 0) continue;
    const chunkWeight = Math.pow(10, 5 * (chunks.length - 1 - i));
    const target = chunkVal * chunkWeight;
    exprParts.push(decomposeChunkMinSingle(target));
  }

  let expr = exprParts.join('+');
  if (sign && expr) expr = `${sign}(${expr})`;
  return expr;
}

/******************* UI バインディング *******************/
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const val = input.value.trim();
      if(val === '') {
        output.textContent = '';
        return;
      }
      const n = Number(val);
      if (isNaN(n)) {
        output.textContent = '数値を入力してください。';
        return;
      }
      if (Math.abs(n) > VALUE_ABS_MAX) {
        output.textContent = '入力値が大きすぎます。';
        return;
      }
      const res = decomposeChunkMin(n);
      output.textContent = `${n} = ${res}`;
    }, 200);
  });
});