/*
 * SutonnyMJ/Bijoy ANSI mapping adapted from the MIT-licensed
 * BinduLogic/bn-ansi-to-unicode converter. The detection layer is local to
 * this app because legacy Bijoy text and ordinary English both use ASCII.
 */

type ConversionOptions = {
  force?: boolean;
};

const PRE_CONVERSION_MAP: Record<string, string> = {
  " +": " ",
  yy: "y",
  vv: "v",
  "„„": "„",
  "­­": "­",
  "y&": "y",
  "„&": "„",
  "‡u": "u‡",
  wu: "uw",
  " ,": ",",
  " \\|": "\\|",
  "\\\\ ": "",
  " \\\\": "",
  "\\\\": "",
  "\n +": "\n",
  " +\n": "\n",
  "\n\n\n\n\n": "\n\n",
  "\n\n\n\n": "\n\n",
  "\n\n\n": "\n\n"
};

const CONVERSION_MAP: Record<string, string> = {
  "°": "ক্ক", "±": "ক্ট", "²": "ক্ষ্ণ", "³": "ক্ত", "´": "ক্ম", "µ": "ক্র",
  "¶": "ক্ষ", "·": "ক্স", "¸": "গু", "¹": "জ্ঞ", "º": "গ্দ", "»": "গ্ধ",
  "¼": "ঙ্ক", "½": "ঙ্গ", "¾": "জ্জ", "¿": "্ত্র", "À": "জ্ঝ", "Á": "জ্ঞ",
  "Â": "ঞ্চ", "Ã": "ঞ্ছ", "Ä": "ঞ্জ", "Å": "ঞ্ঝ", "Æ": "ট্ট", "Ç": "ড্ড",
  "È": "ণ্ট", "É": "ণ্ঠ", "Ê": "ণ্ড", "Ë": "ত্ত", "Ì": "ত্থ", "Î": "ত্র",
  "Ï": "দ্দ", "Ð": "ণ্ড", "Ñ": "-", "Ò": "\"", "Ó": "\"", "Ô": "'", "Õ": "'",
  "×": "দ্ধ", "Ø": "দ্ব", "Ù": "দ্ম", "Ú": "ন্ঠ", "Û": "ন্ড", "Ü": "ন্ধ",
  "Ý": "ন্স", "Þ": "প্ট", "ß": "প্ত", "à": "প্প", "á": "প্স", "â": "ব্জ",
  "ã": "ব্দ", "ä": "ব্ধ", "å": "ভ্র", "ç": "ম্ফ", "é": "ল্ক", "ê": "ল্গ",
  "ë": "ল্ট", "ì": "ল্ড", "í": "ল্প", "î": "ল্ফ", "ï": "শু", "ð": "শ্চ",
  "ñ": "শ্ছ", "ò": "ষ্ণ", "ó": "ষ্ট", "ô": "ষ্ঠ", "õ": "ষ্ফ", "ö": "স্খ",
  "÷": "স্ট", "ø": "স্ন", "ù": "স্ফ", "û": "হু", "ü": "হৃ", "ý": "হ্ন",
  "ÿ": "ক্ষ", "þ": "হ্ম",
  A: "অ", B: "ই", C: "ঈ", D: "উ", E: "ঊ", F: "ঋ", G: "এ", H: "ঐ",
  I: "ও", J: "ঔ", K: "ক", L: "খ", M: "গ", N: "ঘ", O: "ঙ", P: "চ",
  Q: "ছ", R: "জ", S: "ঝ", T: "ঞ", U: "ট", V: "ঠ", W: "ড", X: "ঢ",
  Y: "ণ", Z: "ত", _: "থ", "`": "দ", a: "ধ", b: "ন", c: "প", d: "ফ",
  e: "ব", f: "ভ", g: "ম", h: "য", i: "র", j: "ল", k: "শ", l: "ষ",
  m: "স", n: "হ", o: "ড়", p: "ঢ়", q: "য়", r: "ৎ", s: "ং", t: "ঃ",
  u: "ঁ", "•": "ঙ্", "|": "।"
};

const PRE_SYMBOLS_MAP: Record<string, string> = {
  "®": "ষ্", "¯": "স্", "”": "চ্", "˜": "দ্", "™": "দ্", "š": "ন্",
  "›": "ন্", "¤": "ম্"
};

const REFF: Record<string, string> = {
  "©": "র্"
};

const POST_SYMBOLS_MAP: Record<string, string> = {
  "&": "্‌", "ú": "্প", "è": "্ন", "^": "্ব", "‘": "্তু", "’": "্থ",
  "‹": "্ক", "Œ": "্ক্র", "—": "্ত", "Í": "্ত", "œ": "্ন", "Ÿ": "্ব",
  "¡": "্ব", "¢": "্ভ", "£": "্ভ্র", "¥": "্ম", "¦": "্ব", "§": "্ম",
  "¨": "্য", "ª": "্র", "«": "্র", "¬": "্ল", "­": "্ল", "Ö": "্র"
};

const KAARS: Record<string, string> = {
  v: "া", w: "ি", x: "ী", y: "ু", z: "ু", "æ": "ু", "“": "ু", "–": "ু",
  "~": "ূ", "ƒ": "ূ", "‚": "ূ", "„": "ৃ", "…": "ৃ", "†": "ে", "‡": "ে",
  "ˆ": "ৈ", "‰": "ৈ", "Š": "ৗ"
};

const KAAR_POST_CONVERSION: Record<string, string> = {
  "ো": "ো",
  "ৌ": "ৌ"
};

const POST_CONVERSION_MAP: Record<string, string> = {
  "অা": "আ",
  "্‌্‌": "্‌"
};

const ALL_SYMBOLS = {
  ...CONVERSION_MAP,
  ...PRE_SYMBOLS_MAP,
  ...POST_SYMBOLS_MAP
};

const LEGACY_GLYPH_PATTERN =
  /[°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÎÏÐÑÒÓÔÕ×ØÙÚÛÜÝÞßàáâãäåçéêëìíîïðñòóôõö÷øùûüýÿþ®¯”˜™š›¤©úè‘’‹Œ—ÍœŸ¡¢£¥¦§¨ª«¬­æ“–ƒ‚„…†‡ˆ‰Š•]/;
const ANSI_TOKEN_PATTERN =
  /[A-Za-z_`|&^°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÎÏÐÑÒÓÔÕ×ØÙÚÛÜÝÞßàáâãäåçéêëìíîïðñòóôõö÷øùûüýÿþ®¯”˜™š›¤©úè‘’‹Œ—ÍœŸ¡¢£¥¦§¨ª«¬­æ“–ƒ‚„…†‡ˆ‰Š•]+/g;
const ASCII_BIJOY_HINTS = [
  "Av", "Avg", "wg", "gv", "vi", "ev", "sj", "vq", "‡", "†", "¯", "©",
  "mv", "fv", "K_", "w`", "‡`", "‡Z", "‡g", "‡m", "‡i", "‡j", "›", "š"
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function characterClass(map: Record<string, string>) {
  return Object.keys(map).map(escapeRegExp).join("");
}

function alternatives(map: Record<string, string>) {
  return Object.keys(map)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
}

const SYMBOLS_CONVERSION_PATTERN = new RegExp(`([${characterClass(ALL_SYMBOLS)}])`, "g");
const MAIN_CONVERSION_PATTERN = new RegExp(
  `([w†‡ˆ‰Š]?)(([${characterClass(PRE_SYMBOLS_MAP)}])*([${characterClass(CONVERSION_MAP)}])?([${characterClass(POST_SYMBOLS_MAP)}])*)([${characterClass(REFF)}])?([ævxyz“–~ƒ‚„…]?)([${characterClass(POST_SYMBOLS_MAP)}])*`,
  "g"
);
const HASAANT_PATTERN = /(্)+/g;
const PRE_CONVERSION_PATTERN = new RegExp(`(${alternatives(PRE_CONVERSION_MAP)})`, "g");
const POST_CONVERSION_PATTERN = new RegExp(`(${alternatives(POST_CONVERSION_MAP)})`, "g");

function rawBijoyToUnicode(input: string) {
  let converted = input.replace(
    PRE_CONVERSION_PATTERN,
    (match) => PRE_CONVERSION_MAP[match] ?? match
  );

  converted = converted.replace(
    MAIN_CONVERSION_PATTERN,
    (
      _match,
      preKaar: string,
      unit: string,
      _preSymbols: string,
      _baseSymbol: string,
      _postSymbols: string,
      reff: string,
      postKaar: string,
      postPhala: string
    ) => {
      let core = unit.replace(
        SYMBOLS_CONVERSION_PATTERN,
        (match) => ALL_SYMBOLS[match] ?? match
      );
      core = core.replace(HASAANT_PATTERN, "্");
      core = reff ? `র্${core}` : core;
      core = postPhala ? `${core}${POST_SYMBOLS_MAP[postPhala]}` : core;

      const kaars = `${preKaar ? KAARS[preKaar] : ""}${postKaar ? KAARS[postKaar] : ""}`;
      return `${core}${KAAR_POST_CONVERSION[kaars] ?? kaars}`;
    }
  );

  return converted.replace(
    POST_CONVERSION_PATTERN,
    (match) => POST_CONVERSION_MAP[match] ?? match
  );
}

function bijoyHintScore(input: string) {
  return ASCII_BIJOY_HINTS.reduce(
    (score, hint) => score + (input.includes(hint) ? 1 : 0),
    0
  );
}

function looksLikeBijoyToken(input: string) {
  return LEGACY_GLYPH_PATTERN.test(input) || /[_`|]/.test(input) || bijoyHintScore(input) >= 2;
}

export function looksLikeBijoyText(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  if (LEGACY_GLYPH_PATTERN.test(input)) {
    return true;
  }

  return bijoyHintScore(input) >= 2;
}

function convertBijoyTokensOnly(input: string) {
  return input.replace(ANSI_TOKEN_PATTERN, (token) =>
    looksLikeBijoyToken(token) ? rawBijoyToUnicode(token) : token
  );
}

export function convertBijoyToUnicode(
  input: string,
  options: ConversionOptions = {}
): string {
  if (!input || typeof input !== "string") {
    return input ?? "";
  }

  if (options.force) {
    return rawBijoyToUnicode(input);
  }

  if (!looksLikeBijoyText(input)) {
    return input;
  }

  return convertBijoyTokensOnly(input);
}

export function normalizeBanglaText(input: FormDataEntryValue | null): string | null {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) return null;
  return looksLikeBijoyText(trimmed) ? convertBijoyTokensOnly(trimmed) : trimmed;
}
