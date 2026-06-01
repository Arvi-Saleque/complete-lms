import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyBijoyKey,
  convertBijoyPaste,
  shouldApplyBijoyKey
} from "./bijoy-keyboard";

function typeBijoy(sequence: string) {
  let value = "";
  let caret = 0;

  for (const key of sequence) {
    const next = applyBijoyKey(value, key, caret, caret);
    assert.ok(next);
    value = next.value;
    caret = next.caret;
  }

  return value;
}

describe("bijoy keyboard", () => {
  it("converts a BIJOY key sequence to Unicode Bangla live", () => {
    assert.equal(typeBijoy("Avgvi"), "\u0986\u09ae\u09be\u09b0");
    assert.equal(typeBijoy("evsjv"), "\u09ac\u09be\u0982\u09b2\u09be");
  });

  it("preserves existing English text around Bangla typing", () => {
    const next = applyBijoyKey("Md ", "R", 3, 3);

    assert.deepEqual(next, {
      caret: 4,
      value: "Md \u099c"
    });
  });

  it("leaves English and numbers available when they are not BIJOY keys", () => {
    assert.deepEqual(applyBijoyKey("", "1", 0, 0), { caret: 1, value: "1" });
    assert.deepEqual(applyBijoyKey("Fee ", "1", 4, 4), { caret: 5, value: "Fee 1" });
  });

  it("converts pasted BIJOY text to Unicode", () => {
    assert.equal(
      convertBijoyPaste("Avgvi evsjv"),
      "\u0986\u09ae\u09be\u09b0 \u09ac\u09be\u0982\u09b2\u09be"
    );
  });

  it("keeps pasted Unicode Bangla unchanged", () => {
    const unicode = "\u0986\u09ae\u09bf \u09ac\u09be\u0982\u09b2\u09be";

    assert.equal(convertBijoyPaste(unicode), unicode);
  });

  it("does not damage pasted English text", () => {
    assert.equal(convertBijoyPaste("Student name and address"), "Student name and address");
  });

  it("does not intercept navigation, editing, or control shortcuts", () => {
    for (const key of ["Backspace", "Delete", "ArrowLeft", "Tab", "Enter"]) {
      assert.equal(applyBijoyKey("\u0986\u09ae\u09be\u09b0", key, 4, 4), null);
      assert.equal(shouldApplyBijoyKey({ key }), false);
    }

    assert.equal(shouldApplyBijoyKey({ ctrlKey: true, key: "a" }), false);
    assert.equal(shouldApplyBijoyKey({ key: "a", metaKey: true }), false);
    assert.equal(shouldApplyBijoyKey({ altKey: true, key: "a" }), false);
  });
});
