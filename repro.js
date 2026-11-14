// Reproduction + audit script for the AIProve bug-hunt-utils challenge.
// Usage: node repro.js
// Requires ./utils.js — an UNMODIFIED copy of the challenge file from
// https://github.com/AIProveRH/aiprove/tree/main/challenges/bug-hunt-utils
// (copied here so this repo reproduces standalone).
//
// Exit code: 0 if every reported bug reproduces AND every "correct" function
// passes its sanity checks; 1 otherwise.

const u = require("./utils.js");

let failures = 0;
function check(name, actual, expected, isBugReport) {
  const equal = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  // For a bug report, "success" means the bug reproduces: actual != expected.
  // For a sanity check, "success" means the function behaves correctly.
  const ok = isBugReport ? !equal : equal;
  const tag = isBugReport ? "BUG-REPORT" : "sanity";
  console.log(`[${tag}] ${name}: actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)} -> ${ok ? "REPRODUCED/PASS" : "NOT-REPRODUCED/FAIL"}`);
  if (!ok) failures++;
}

// ---------------------------------------------------------------------------
// Reported bugs (also listed in bugs.json). Each one: actual != correct output.
// ---------------------------------------------------------------------------

// 1. factorial: loop `i < n` never multiplies by n itself.
check("factorial(5)", u.factorial(5), 120, true);
check("factorial(2)", u.factorial(2), 2, true);
check("factorial(3)", u.factorial(3), 6, true);

// 2. countVowels: regex /[aeiou]/g has no `i` flag, misses uppercase vowels.
check('countVowels("AEIOU")', u.countVowels("AEIOU"), 5, true);
check('countVowels("Apple")', u.countVowels("Apple"), 2, true);

// 3. titleCase: capitalises word-initial letters but never lowercases the rest,
//    so mixed/upper-case input stays shouted instead of becoming Title Case.
check('titleCase("hELLO wORLD")', u.titleCase("hELLO wORLD"), "Hello World", true);
check('titleCase("HELLO WORLD")', u.titleCase("HELLO WORLD"), "Hello World", true);

// 4. reverse: s.split("") splits UTF-16 code units, so astral-plane characters
//    (emoji etc.) come back as broken lone surrogates instead of staying intact.
check('reverse("😀a")', u.reverse("😀a"), "a😀", true);
check('reverse("a😀b")', u.reverse("a😀b"), "b😀a", true);

// ---------------------------------------------------------------------------
// Sanity checks on the functions we did NOT report (they behave correctly).
// ---------------------------------------------------------------------------
check("sum([1,2,3])", u.sum([1, 2, 3]), 6, false);
check("sum([])", u.sum([]), 0, false);
check("max([3,1,2])", u.max([3, 1, 2]), 3, false);
check("max([-5,-1])", u.max([-5, -1]), -1, false);
check('reverse("abc")', u.reverse("abc"), "cba", false);
check('reverse("")', u.reverse(""), "", false);
check('isPalindrome("racecar")', u.isPalindrome("racecar"), true, false);
check('isPalindrome("hello")', u.isPalindrome("hello"), false, false);
check("factorial(0)", u.factorial(0), 1, false);
check("factorial(1)", u.factorial(1), 1, false);
check("clamp(5,0,10)", u.clamp(5, 0, 10), 5, false);
check("clamp(-1,0,10)", u.clamp(-1, 0, 10), 0, false);
check("clamp(15,0,10)", u.clamp(15, 0, 10), 10, false);
check("unique([1,1,2,3,3])", u.unique([1, 1, 2, 3, 3]), [1, 2, 3], false);
check("average([1,2,3])", u.average([1, 2, 3]), 2, false);
check('titleCase("hello world")', u.titleCase("hello world"), "Hello World", false);
check('countVowels("hello")', u.countVowels("hello"), 2, false);
check('countVowels("bcdfg")', u.countVowels("bcdfg"), 0, false);

console.log(failures === 0
  ? "\nALL CHECKS PASSED: 4 bugs reproduced, 18 sanity checks passed."
  : `\n${failures} CHECK(S) FAILED — see above.`);
process.exit(failures === 0 ? 0 : 1);
