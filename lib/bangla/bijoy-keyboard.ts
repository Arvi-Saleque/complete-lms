import {
  convertBijoyToUnicode,
  looksLikeBijoyText
} from "./bijoy-to-unicode";

type BijoyKeyEventLike = {
  altKey?: boolean;
  ctrlKey?: boolean;
  defaultPrevented?: boolean;
  isComposing?: boolean;
  key: string;
  metaKey?: boolean;
};

export type BijoyTokenState = {
  raw: string;
  start: number;
  end: number;
};

export type BijoyKeyResult = {
  caret: number;
  state: BijoyTokenState | null;
  value: string;
};

const tokenBoundaryPattern = /^[\s\r\n\t]$/;
const liveBijoyOverrides: Record<string, string> = {
  Q: "X"
};
const banglaPattern = /[\u0980-\u09ff]/;
const pasteTokenPattern = /[^\s,;:()[\]{}]+/g;
const asciiBijoyPasteHints = [
  /Av/,
  /[A-Za-z]v/,
  /[A-Z][xy~]/,
  /w[A-ZKLVPRTZa-z]/,
  /[A-Za-z][©¶ÿÖ¯’¤ÂÃ]/,
  /[†‡Öÿ¶¯’¤]/,
  /\b(?:wcZvi|gvZvi|wVKvbv|LvZzb|Avjx|QvKv|bvg|evsjv)\b/
];

let defaultTokenState: BijoyTokenState | null = null;

export function shouldApplyBijoyKey(event: BijoyKeyEventLike) {
  return (
    event.key.length === 1 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.defaultPrevented &&
    !event.isComposing &&
    !event.metaKey
  );
}

function replaceRange(inputValue: string, start: number, end: number, replacement: string) {
  return {
    caret: start + replacement.length,
    value: `${inputValue.slice(0, start)}${replacement}${inputValue.slice(end)}`
  };
}

function normalizeLiveBijoyToken(raw: string) {
  return Array.from(raw, (key) => liveBijoyOverrides[key] ?? key).join("");
}

function convertLiveBijoyToken(raw: string) {
  return convertBijoyToUnicode(normalizeLiveBijoyToken(raw), { force: true })
    .replaceAll("\u09c7\u09d7", "\u09cc")
    .replaceAll("\u09cd\u200c", "\u09cd");
}

function isTokenBoundary(key: string) {
  return tokenBoundaryPattern.test(key);
}

function shouldConvertBijoyPasteToken(token: string) {
  if (!token || banglaPattern.test(token)) return false;
  return looksLikeBijoyText(token) || asciiBijoyPasteHints.some((pattern) => pattern.test(token));
}

function isStateUsable(
  state: BijoyTokenState | null,
  inputValue: string,
  selectionStart: number,
  selectionEnd: number
) {
  return (
    state !== null &&
    selectionStart === selectionEnd &&
    selectionStart === state.end &&
    inputValue.slice(state.start, state.end) === convertLiveBijoyToken(state.raw)
  );
}

export function resetBijoyKeyboardState() {
  defaultTokenState = null;
}

export function applyBijoyKeyWithState(
  inputValue: string,
  key: string,
  selectionStart: number,
  selectionEnd: number,
  state: BijoyTokenState | null,
  event?: BijoyKeyEventLike
): BijoyKeyResult | null {
  if (
    key.length !== 1 ||
    selectionStart < 0 ||
    selectionEnd < selectionStart ||
    (event && !shouldApplyBijoyKey(event))
  ) {
    return null;
  }

  if (isTokenBoundary(key)) {
    const next = replaceRange(inputValue, selectionStart, selectionEnd, key);
    return { ...next, state: null };
  }

  const activeState = isStateUsable(state, inputValue, selectionStart, selectionEnd)
    ? state
    : null;
  const tokenStart = activeState?.start ?? selectionStart;
  const tokenEnd = activeState?.end ?? selectionEnd;
  const rawToken = `${activeState?.raw ?? ""}${key}`;
  const convertedToken = convertLiveBijoyToken(rawToken);
  const next = replaceRange(inputValue, tokenStart, tokenEnd, convertedToken);

  return {
    ...next,
    state: {
      raw: rawToken,
      start: tokenStart,
      end: next.caret
    }
  };
}

export function applyBijoyKey(
  inputValue: string,
  key: string,
  selectionStart: number,
  selectionEnd: number,
  event?: BijoyKeyEventLike
): { value: string; caret: number } | null {
  const result = applyBijoyKeyWithState(
    inputValue,
    key,
    selectionStart,
    selectionEnd,
    defaultTokenState,
    event
  );

  defaultTokenState = result?.state ?? null;

  return result ? { value: result.value, caret: result.caret } : null;
}

export function handleBijoyPaste(
  inputValue: string,
  pastedText: string,
  selectionStart: number,
  selectionEnd: number
) {
  const converted = convertBijoyPaste(pastedText);
  return replaceRange(inputValue, selectionStart, selectionEnd, converted);
}

export function convertBijoyPaste(text: string) {
  if (!text) return "";

  return text.replace(pasteTokenPattern, (token) =>
    shouldConvertBijoyPasteToken(token) ? convertLiveBijoyToken(token) : token
  );
}
