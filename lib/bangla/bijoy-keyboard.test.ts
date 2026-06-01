import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyBijoyKey,
  convertBijoyPaste,
  handleBijoyPaste,
  resetBijoyKeyboardState,
  shouldApplyBijoyKey
} from "./bijoy-keyboard";

function typeBijoy(sequence: string, initialValue = "") {
  resetBijoyKeyboardState();
  let value = initialValue;
  let caret = value.length;

  for (const key of sequence) {
    const next = applyBijoyKey(value, key, caret, caret);
    assert.ok(next, `Expected ${JSON.stringify(key)} to be handled`);
    value = next.value;
    caret = next.caret;
  }

  return value;
}

describe("bijoy keyboard", () => {
  it("passes the required live BIJOY acceptance sequences", () => {
    const acceptanceCases = [
      ["Avgvi", "\u0986\u09ae\u09be\u09b0"],
      ["evsjv", "\u09ac\u09be\u0982\u09b2\u09be"],
      ["Avwg", "\u0986\u09ae\u09bf"],
      ["\u2020Zvgvi", "\u09a4\u09cb\u09ae\u09be\u09b0"],
      ["wk\u00ffK", "\u09b6\u09bf\u0995\u09cd\u09b7\u0995"],
      ["QvKv", "\u09a2\u09be\u0995\u09be"],
      ["K\u00acvm", "\u0995\u09cd\u09b2\u09be\u09b8"],
      ["\u2020k\u00d6wY", "\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf"],
      ["wcZv", "\u09aa\u09bf\u09a4\u09be"],
      ["gvZv", "\u09ae\u09be\u09a4\u09be"],
      ["bvg", "\u09a8\u09be\u09ae"],
      ["wVKvbv", "\u09a0\u09bf\u0995\u09be\u09a8\u09be"]
    ] as const;

    for (const [sequence, expected] of acceptanceCases) {
      assert.equal(typeBijoy(sequence), expected, sequence);
    }
  });

  it("maps basic consonants", () => {
    assert.equal(typeBijoy("KLMNO"), "\u0995\u0996\u0997\u0998\u0999");
    assert.equal(typeBijoy("Z_`ab"), "\u09a4\u09a5\u09a6\u09a7\u09a8");
  });

  it("maps basic independent vowels", () => {
    assert.equal(
      typeBijoy("ABCDEFGHIJ"),
      "\u0985\u0987\u0988\u0989\u098a\u098b\u098f\u0990\u0993\u0994"
    );
    assert.equal(typeBijoy("Av"), "\u0986");
  });

  it("applies post-base kar signs after consonants", () => {
    assert.equal(typeBijoy("Kv"), "\u0995\u09be");
    assert.equal(typeBijoy("Kx"), "\u0995\u09c0");
    assert.equal(typeBijoy("Ky"), "\u0995\u09c1");
    assert.equal(typeBijoy("K~"), "\u0995\u09c2");
  });

  it("holds pre-base kar signs and places them after the typed consonant", () => {
    assert.equal(typeBijoy("wK"), "\u0995\u09bf");
    assert.equal(typeBijoy("\u2020K"), "\u0995\u09c7");
    assert.equal(typeBijoy("\u2021Kv"), "\u0995\u09cb");
    assert.equal(typeBijoy("\u02c6K"), "\u0995\u09c8");
    assert.equal(typeBijoy("\u2021K\u0160"), "\u0995\u09cc");
  });

  it("supports hasanta and common conjunct composition", () => {
    assert.equal(typeBijoy("K&K"), "\u0995\u09cd\u0995");
    assert.equal(typeBijoy("K&l"), "\u0995\u09cd\u09b7");
    assert.equal(typeBijoy("R&T"), "\u099c\u09cd\u099e");
    assert.equal(typeBijoy("wk\u00ffK"), "\u09b6\u09bf\u0995\u09cd\u09b7\u0995");
  });

  it("supports reph and ra-phala", () => {
    assert.equal(typeBijoy("\u00a9K"), "\u09b0\u09cd\u0995");
    assert.equal(typeBijoy("K\u00a9"), "\u09b0\u09cd\u0995");
    assert.equal(typeBijoy("K\u00aa"), "\u0995\u09cd\u09b0");
    assert.equal(typeBijoy("M\u00d6vg"), "\u0997\u09cd\u09b0\u09be\u09ae");
    assert.equal(typeBijoy("\u2020k\u00d6wY"), "\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf");
  });

  it("supports ya-phala", () => {
    assert.equal(typeBijoy("K\u00a8v"), "\u0995\u09cd\u09af\u09be");
    assert.equal(typeBijoy("e\u00a8v"), "\u09ac\u09cd\u09af\u09be");
  });

  it("preserves punctuation, spaces, newlines, and unmapped numbers", () => {
    assert.equal(
      typeBijoy("Avgvi evsjv|"),
      "\u0986\u09ae\u09be\u09b0 \u09ac\u09be\u0982\u09b2\u09be\u0964"
    );
    assert.equal(typeBijoy("K1\nL2"), "\u09951\n\u09962");
  });

  it("replaces selected text without converting the whole field", () => {
    resetBijoyKeyboardState();
    assert.deepEqual(applyBijoyKey("Student name", "K", 8, 12), {
      caret: 9,
      value: "Student \u0995"
    });
  });

  it("keeps navigation, editing, and shortcut keys out of the keyboard engine", () => {
    for (const key of ["Backspace", "Delete", "ArrowLeft", "Tab", "Enter"]) {
      assert.equal(applyBijoyKey("\u0986\u09ae\u09be\u09b0", key, 4, 4), null);
      assert.equal(shouldApplyBijoyKey({ key }), false);
    }

    assert.equal(shouldApplyBijoyKey({ ctrlKey: true, key: "a" }), false);
    assert.equal(shouldApplyBijoyKey({ key: "a", metaKey: true }), false);
    assert.equal(shouldApplyBijoyKey({ altKey: true, key: "a" }), false);
  });

  it("converts pasted BIJOY text to Unicode", () => {
    assert.equal(
      convertBijoyPaste("Avgvi evsjv"),
      "\u0986\u09ae\u09be\u09b0 \u09ac\u09be\u0982\u09b2\u09be"
    );
    assert.deepEqual(handleBijoyPaste("Name: ", "Avgvi", 6, 6), {
      caret: 10,
      value: "Name: \u0986\u09ae\u09be\u09b0"
    });
  });

  it("keeps pasted Unicode Bangla unchanged", () => {
    const unicode = "\u0986\u09ae\u09bf \u09ac\u09be\u0982\u09b2\u09be";

    assert.equal(convertBijoyPaste(unicode), unicode);
    assert.deepEqual(handleBijoyPaste("", unicode, 0, 0), {
      caret: unicode.length,
      value: unicode
    });
  });

  it("does not damage pasted English text", () => {
    assert.equal(convertBijoyPaste("Student name and address"), "Student name and address");
    assert.deepEqual(handleBijoyPaste("Note: ", "Room 2", 6, 6), {
      caret: 12,
      value: "Note: Room 2"
    });
  });

  it("handles practical office examples", () => {
    assert.equal(typeBijoy("ivwng"), "\u09b0\u09be\u09b9\u09bf\u09ae");
    assert.equal(typeBijoy("gvnv"), "\u09ae\u09be\u09b9\u09be");
    assert.equal(typeBijoy("evwo"), "\u09ac\u09be\u09dc\u09bf");
    assert.equal(typeBijoy("K\u00acvm"), "\u0995\u09cd\u09b2\u09be\u09b8");
    assert.equal(typeBijoy("A"), "\u0985");
  });
});
