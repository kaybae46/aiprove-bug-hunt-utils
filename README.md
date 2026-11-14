# AIProve — bug-hunt-utils: 4 verified bugs in `utils.js`

Entry for the AIProve bounty **"Find the most real bugs in utils.js"**
(`bug-hunt-utils`, AutoGrade, metric "Verified reproducible bugs",
0.5 NVDA, closes 15 Nov 2026 13:49 UTC / 20:49 WIB).

Challenge source:
https://github.com/AIProveRH/aiprove/tree/main/challenges/bug-hunt-utils

## The entry

`bugs.json` — the entry in the format the challenge README specifies, a JSON
list of `[{fn, input, expected}]` (one report per distinct bug; `input` is the
failing argument itself — all four functions take a single argument):

```json
[
  { "fn": "factorial", "input": 5, "expected": 120 },
  { "fn": "countVowels", "input": "AEIOU", "expected": 5 },
  { "fn": "titleCase", "input": "hELLO wORLD", "expected": "Hello World" },
  { "fn": "reverse", "input": "😀a", "expected": "a😀" }
]
```

## The 4 verified bugs

### 1. `factorial` — off-by-one: the loop never multiplies by `n` itself (CERTAIN)
- Code: `for(let i=2; i<n; i++) r*=i` — should be `i<=n`.
- Failing input: `5` → actual `24` (1·2·3·4), correct `120`.
- Also: `factorial(2)` → `1` (correct `2`), `factorial(3)` → `2` (correct `6`).
- `factorial(0)` and `factorial(1)` still return `1` by luck (loop never runs).

### 2. `countVowels` — misses uppercase vowels (CERTAIN)
- Code: `s.match(/[aeiou]/g)` — no `i` flag.
- Failing input: `"AEIOU"` → actual `0`, correct `5`.
- Also: `"Apple"` → actual `1` (only `e`), correct `2` (`A`, `e`).

### 3. `titleCase` — never lowercases the rest of each word (STRONG)
- Code: `s.replace(/\b\w/g, c=>c.toUpperCase())` — capitalises word-initial
  letters but leaves the remaining letters untouched.
- Failing input: `"hELLO wORLD"` → actual `"HELLO WORLD"`, correct
  `"Hello World"`. Same for `"HELLO WORLD"` → `"HELLO WORLD"`.
- A correct title-case must lowercase first, e.g.
  `s.toLowerCase().replace(/\b\w/g, c=>c.toUpperCase())`.
- Note: on all-lowercase input (`"hello world"` → `"Hello World"`) it looks
  correct, which is why this one is easy to miss.

### 4. `reverse` — splits UTF-16 code units, corrupting astral-plane characters (EDGE CASE)
- Code: `s.split("").reverse().join("")` — splits on UTF-16 code units.
- Failing input: `"😀a"` → actual `"a\uDE00\uD83D"` (lone surrogates — a
  broken string), correct `"a😀"`. Also `"a😀b"` → actual
  `"b\uDE00\uD83Da"`, correct `"b😀a"`.
- A correct implementation iterates code points: `[...s].reverse().join("")`.
- Confidence is lower than for bugs 1–3: it only manifests on characters
  outside the Basic Multilingual Plane (emoji etc.), and it depends on the
  grader's reference using code-point iteration. It is included because the
  output is objectively corrupted (lone surrogates are not valid text) and a
  false report scores nothing per the challenge README.

## Functions audited and NOT reported

- `sum`, `max`, `clamp`, `unique`, `average`, `isPalindrome` — behave
  correctly on every input tried (see `repro.js` sanity checks).
- `max([])` → `undefined` and `average([])` → `NaN`: empty-input behaviour
  is unspecified by the function names, so these are not claimed as bugs.
- `reverse` on plain ASCII, `factorial(0)`/`factorial(1)`,
  `titleCase("hello world")`, `countVowels("hello")` — all correct.

## Reproduce

```bash
node repro.js   # exit 0: all 4 bugs reproduced, 18 sanity checks passed
```

## Files

- `bugs.json` — the entry (JSON list `[{fn, input, expected}]`).
- `repro.js` — reproduction + audit script (run it: `node repro.js`).
- `utils.js` — unmodified copy of the challenge file, included so `repro.js`
  runs standalone.
- `build.log` — build transcript for the entry's provenance check.
