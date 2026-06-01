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

const maxContextChars = 24;
const banglaBlockStart = 0x0980;
const banglaBlockEnd = 0x09ff;
const zeroWidthNonJoiner = 0x200c;

function isBanglaContextChar(character: string) {
  const codePoint = character.codePointAt(0);

  return (
    codePoint === zeroWidthNonJoiner ||
    (codePoint !== undefined && codePoint >= banglaBlockStart && codePoint <= banglaBlockEnd)
  );
}

function findContextStart(inputValue: string, caret: number) {
  let start = caret;
  let count = 0;

  while (start > 0 && count < maxContextChars) {
    const previous = inputValue[start - 1];
    if (!isBanglaContextChar(previous)) break;

    start -= 1;
    count += 1;
  }

  return start;
}

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

export function applyBijoyKey(
  inputValue: string,
  key: string,
  selectionStart: number,
  selectionEnd: number
): { value: string; caret: number } | null {
  if (key.length !== 1 || selectionStart < 0 || selectionEnd < selectionStart) return null;

  const contextStart =
    selectionStart === selectionEnd ? findContextStart(inputValue, selectionStart) : selectionStart;
  const prefix = inputValue.slice(0, contextStart);
  const context = inputValue.slice(contextStart, selectionStart);
  const suffix = inputValue.slice(selectionEnd);
  const converted = convertBijoyToUnicode(`${context}${key}`, { force: true });

  return {
    caret: prefix.length + converted.length,
    value: `${prefix}${converted}${suffix}`
  };
}

export function convertBijoyPaste(text: string) {
  return looksLikeBijoyText(text) ? convertBijoyToUnicode(text) : text;
}
