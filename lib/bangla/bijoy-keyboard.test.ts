import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { convertBijoyToUnicode } from "./bijoy-to-unicode";
import {
  applyBijoyKey,
  convertBijoyPaste,
  handleBijoyPaste,
  resetBijoyKeyboardState,
  shouldApplyBijoyKey
} from "./bijoy-keyboard";

const exactCases: Array<[string, string]> = [
  ["Avgvi", "আমার"],
  ["evsjv", "বাংলা"],
  ["Avwg", "আমি"],
  ["†Zvgvi", "তোমার"],
  ["wkÿK", "শিক্ষক"],
  ["QvKv", "ঢাকা"],
  ["K¬vm", "ক্লাস"],
  ["†kÖwY", "শ্রেণি"],
  ["wcZv", "পিতা"],
  ["gvZv", "মাতা"],
  ["bvg", "নাম"],
  ["wVKvbv", "ঠিকানা"],
  ["fwZ©", "ভর্তি"],
  ["wk¶v_©x", "শিক্ষার্থী"],
  ["Aa¨vq", "অধ্যায়"],
  ["cix¶v", "পরীক্ষা"],
  ["djvdj", "ফলাফল"],
  ["Dcw¯’wZ", "উপস্থিতি"],
  ["Abycw¯’wZ", "অনুপস্থিতি"],
  ["†kÖwYwk¶K", "শ্রেণিশিক্ষক"],
  ["cÖavb wk¶K", "প্রধান শিক্ষক"],
  ["mnKvix wk¶K", "সহকারী শিক্ষক"],
  ["wcZvi bvg", "পিতার নাম"],
  ["gvZvi bvg", "মাতার নাম"],
  ["AwffveK", "অভিভাবক"],
  ["Rb¥ ZvwiL", "জন্ম তারিখ"],
  ["†gvevBj b¤^i", "মোবাইল নম্বর"],
  ["¯’vqx wVKvbv", "স্থায়ী ঠিকানা"],
  ["eZ©gvb wVKvbv", "বর্তমান ঠিকানা"],
  ["ms¯‹…Z", "সংস্কৃত"],
  ["cÖK…wZ", "প্রকৃতি"],
  ["m„wó", "সৃষ্টি"],
  ["K…wl", "কৃষি"],
  ["g„Zz¨", "মৃত্যু"],
  ["m¤úK©", "সম্পর্ক"],
  ["cÖwZôvb", "প্রতিষ্ঠান"],
  ["cÖ_g", "প্রথম"],
  ["wØZxq", "দ্বিতীয়"],
  ["Z…Zxq", "তৃতীয়"],
  ["PZz_©", "চতুর্থ"],
  ["cÂg", "পঞ্চম"],
  ["lô", "ষষ্ঠ"],
  ["mßg", "সপ্তম"],
  ["Aóg", "অষ্টম"],
  ["beg", "নবম"],
  ["`kg", "দশম"],
  ["gv`ªvmv", "মাদ্রাসা"],
  ["Bmjvg", "ইসলাম"],
  ["KziAvb", "কুরআন"],
  ["nvwdR", "হাফিজ"],
  ["Avwjg", "আলিম"],
  ["`vwLj", "দাখিল"],
  ["nvw`m", "হাদিস"],
  ["wZjvIqvZ", "তিলাওয়াত"],
  ["ZvRwe`", "তাজবিদ"],
  [
    "Avgvi evsjv wkÿK QvKv †kÖwY wVKvbv",
    "আমার বাংলা শিক্ষক ঢাকা শ্রেণি ঠিকানা"
  ]
];

const bijoyCorpus = [
  "Avgvi",
  "evsjv",
  "Avwg",
  "†Zvgvi",
  "wkÿK",
  "QvKv",
  "†kÖwY",
  "wVKvbv",
  "fwZ©",
  "wk¶v_©x",
  "Aa¨vq",
  "cix¶v",
  "djvdj",
  "Dcw¯’wZ",
  "Abycw¯’wZ",
  "cÖavb wk¶K",
  "mnKvix wk¶K",
  "wcZvi bvg",
  "gvZvi bvg",
  "AwffveK",
  "Rb¥ ZvwiL",
  "†gvevBj b¤^i",
  "¯’vqx wVKvbv",
  "eZ©gvb wVKvbv",
  "ms¯‹…Z",
  "cÖK…wZ",
  "m„wó",
  "K…wl",
  "g„Zz¨",
  "m¤úK©",
  "cÖwZôvb",
  "cÖ_g",
  "wØZxq",
  "Z…Zxq",
  "PZz_©",
  "cÂg",
  "lô",
  "mßg",
  "Aóg",
  "beg",
  "`kg",
  "gv`ªvmv",
  "Bmjvg",
  "KziAvb",
  "nvwdR",
  "Avwjg",
  "`vwLj",
  "nvw`m",
  "wZjvIqvZ",
  "ZvRwe`",
  "Avgvi evsjv wkÿK QvKv †kÖwY wVKvbv"
];

const formCases: Array<[string, string]> = [
  ["bvg: Avgvi", "নাম: আমার"],
  ["wcZvi bvg: †gvnv¤§` Avjx", "পিতার নাম: মোহাম্মদ আলী"],
  ["gvZvi bvg: dv‡Zgv LvZzb", "মাতার নাম: ফাতেমা খাতুন"],
  ["wVKvbv: QvKv evsjv‡`k", "ঠিকানা: ঢাকা বাংলাদেশ"],
  ["†kÖwY: cÂg", "শ্রেণি: পঞ্চম"],
  ["†gvevBj: 01700000000", "মোবাইল: 01700000000"]
];

function typeBijoy(sequence: string, initialValue = "") {
  resetBijoyKeyboardState();
  let value = initialValue;
  let caret = value.length;

  for (const key of Array.from(sequence)) {
    const next = applyBijoyKey(value, key, caret, caret);
    assert.ok(next, `Expected ${JSON.stringify(key)} to be handled`);
    value = next.value;
    caret = next.caret;
  }

  return value;
}

function typeBijoySequence(sequence: string): string {
  resetBijoyKeyboardState();
  let value = "";
  let caret = 0;

  for (const key of Array.from(sequence)) {
    const result = applyBijoyKey(value, key, caret, caret);
    if (result) {
      value = result.value;
      caret = result.caret;
    } else {
      value = value.slice(0, caret) + key + value.slice(caret);
      caret += key.length;
    }
  }

  return value;
}

describe("bijoy keyboard", () => {
  it("passes exact live BIJOY cases", () => {
    for (const [raw, expected] of exactCases) {
      assert.equal(typeBijoySequence(raw), expected, raw);
    }
  });

  it("matches paste converter for the BIJOY corpus", () => {
    for (const raw of bijoyCorpus) {
      assert.equal(typeBijoySequence(raw), convertBijoyToUnicode(raw, { force: true }), raw);
    }
  });

  it("handles form-like BIJOY strings", () => {
    for (const [raw, expected] of formCases) {
      assert.equal(typeBijoySequence(raw), expected, raw);
    }
  });

  it("does not leave raw BIJOY fragments after mixed hard typing", () => {
    const output = typeBijoySequence("Avgvi evsjv wkÿK QvKv †kÖwY wVKvbv");

    assert.equal(output, "আমার বাংলা শিক্ষক ঢাকা শ্রেণি ঠিকানা");
    assert.equal(output.includes("QvKv"), false);
    assert.equal(output.includes("†kÖwY"), false);
    assert.equal(output.includes("wVKvbv"), false);
    assert.equal(output.includes("†"), false);
    assert.equal(output.includes("ÿ"), false);
  });

  it("maps basic consonants", () => {
    assert.equal(typeBijoy("KLMNO"), "কখগঘঙ");
    assert.equal(typeBijoy("Z_`ab"), "তথদধন");
  });

  it("maps basic independent vowels", () => {
    assert.equal(typeBijoy("ABCDEFGHIJ"), "অইঈউঊঋএঐওঔ");
    assert.equal(typeBijoy("Av"), "আ");
  });

  it("applies post-base kar signs after consonants", () => {
    assert.equal(typeBijoy("Kv"), "কা");
    assert.equal(typeBijoy("Kx"), "কী");
    assert.equal(typeBijoy("Ky"), "কু");
    assert.equal(typeBijoy("K~"), "কূ");
  });

  it("holds pre-base kar signs and places them after the typed consonant", () => {
    assert.equal(typeBijoy("wK"), "কি");
    assert.equal(typeBijoy("†K"), "কে");
    assert.equal(typeBijoy("‡Kv"), "কো");
    assert.equal(typeBijoy("ˆK"), "কৈ");
    assert.equal(typeBijoy("‡KŠ"), "কৌ");
  });

  it("supports hasanta and common conjunct composition", () => {
    assert.equal(typeBijoy("K&K"), "ক্ক");
    assert.equal(typeBijoy("K&l"), "ক্ষ");
    assert.equal(typeBijoy("R&T"), "জ্ঞ");
    assert.equal(typeBijoy("wkÿK"), "শিক্ষক");
  });

  it("supports reph and ra-phala", () => {
    assert.equal(typeBijoy("©K"), "র্ক");
    assert.equal(typeBijoy("K©"), "র্ক");
    assert.equal(typeBijoy("Kª"), "ক্র");
    assert.equal(typeBijoy("MÖvg"), "গ্রাম");
    assert.equal(typeBijoy("†kÖwY"), "শ্রেণি");
  });

  it("supports ya-phala", () => {
    assert.equal(typeBijoy("K¨v"), "ক্যা");
    assert.equal(typeBijoy("e¨v"), "ব্যা");
  });

  it("preserves punctuation, spaces, newlines, and unmapped numbers", () => {
    assert.equal(typeBijoy("Avgvi evsjv|"), "আমার বাংলা।");
    assert.equal(typeBijoy("K1\nL2"), "ক1\nখ2");
  });

  it("replaces selected text without converting the whole field", () => {
    resetBijoyKeyboardState();
    assert.deepEqual(applyBijoyKey("Student name", "K", 8, 12), {
      caret: 9,
      value: "Student ক"
    });
  });

  it("replaces selected Bangla text in BIJOY mode", () => {
    resetBijoyKeyboardState();
    const initial = "পুরাতন";
    const result = applyBijoyKey(initial, "A", 0, initial.length);

    assert.equal(result?.value, "অ");
    assert.equal(result?.caret, "অ".length);
  });

  it("keeps spaces and starts a new raw token after space", () => {
    assert.equal(typeBijoySequence("Avgvi evsjv"), "আমার বাংলা");
  });

  it("keeps numbers unchanged inside form text", () => {
    assert.equal(typeBijoySequence("†ivj 123"), "রোল 123");
  });

  it("keeps navigation, editing, and shortcut keys out of the keyboard engine", () => {
    for (const key of ["Backspace", "Delete", "ArrowLeft", "Tab", "Enter"]) {
      assert.equal(applyBijoyKey("আমার", key, 4, 4), null);
      assert.equal(shouldApplyBijoyKey({ key }), false);
    }

    assert.equal(shouldApplyBijoyKey({ ctrlKey: true, key: "a" }), false);
    assert.equal(shouldApplyBijoyKey({ key: "a", metaKey: true }), false);
    assert.equal(shouldApplyBijoyKey({ altKey: true, key: "a" }), false);
  });

  it("converts pasted BIJOY text to Unicode", () => {
    assert.equal(convertBijoyPaste("Avgvi evsjv"), "আমার বাংলা");
    assert.deepEqual(handleBijoyPaste("Name: ", "Avgvi", 6, 6), {
      caret: 10,
      value: "Name: আমার"
    });
  });

  it("force-converts hard BIJOY paste fragments in BIJOY mode", () => {
    const pasted = "Avgvi evsjv wkÿK QvKv †kÖwY wVKvbv";
    const expected = "আমার বাংলা শিক্ষক ঢাকা শ্রেণি ঠিকানা";

    assert.equal(convertBijoyPaste(pasted), expected);
    assert.deepEqual(handleBijoyPaste("", pasted, 0, 0), {
      caret: expected.length,
      value: expected
    });
  });

  it("converts mixed Unicode Bangla and BIJOY paste fragments", () => {
    assert.equal(
      convertBijoyPaste("নাম: Avgvi evsjv QvKv wVKvbv"),
      "নাম: আমার বাংলা ঢাকা ঠিকানা"
    );
  });

  it("repairs partially converted BIJOY paste output", () => {
    assert.equal(
      convertBijoyPaste("আমার বাংলা শিক্ষক QvKv †kÖwY wVKvbv"),
      "আমার বাংলা শিক্ষক ঢাকা শ্রেণি ঠিকানা"
    );
  });

  it("preserves English labels while converting BIJOY paste values", () => {
    assert.equal(
      convertBijoyPaste("Student: Avgvi, Address: QvKv"),
      "Student: আমার, Address: ঢাকা"
    );
  });

  it("force-converts multiline BIJOY form paste", () => {
    const pasted = [
      "wcZvi bvg: †gvnv¤§` Avjx",
      "gvZvi bvg: dv‡Zgv LvZzb",
      "wVKvbv: QvKv evsjv‡`k"
    ].join("\n");
    const expected = [
      "পিতার নাম: মোহাম্মদ আলী",
      "মাতার নাম: ফাতেমা খাতুন",
      "ঠিকানা: ঢাকা বাংলাদেশ"
    ].join("\n");

    assert.deepEqual(handleBijoyPaste("", pasted, 0, 0), {
      caret: expected.length,
      value: expected
    });
  });

  it("does not leave raw BIJOY fragments after paste conversion", () => {
    const output = convertBijoyPaste(
      "wcZvi bvg: †gvnv¤§` Avjx\ngvZvi bvg: dv‡Zgv LvZzb\nwVKvbv: QvKv evsjv‡`k"
    );

    for (const fragment of ["QvKv", "wVKvbv", "wcZvi", "gvZvi", "†", "ÿ"]) {
      assert.equal(output.includes(fragment), false, fragment);
    }
  });

  it("keeps pasted Unicode Bangla unchanged", () => {
    const unicode = "আমি বাংলা";

    assert.equal(convertBijoyPaste(unicode), unicode);
    assert.deepEqual(handleBijoyPaste("", unicode, 0, 0), {
      caret: unicode.length,
      value: unicode
    });
  });

  it("does not damage pasted English text", () => {
    assert.equal(convertBijoyPaste("Student name and address"), "Student name and address");
    assert.equal(convertBijoyPaste("Md Rahim 123"), "Md Rahim 123");
    assert.equal(
      convertBijoyPaste("Student name: Md Rahim, Roll: 123"),
      "Student name: Md Rahim, Roll: 123"
    );
    assert.equal(
      convertBijoyPaste("Phone: 01700000000, Date: 01/02/2026"),
      "Phone: 01700000000, Date: 01/02/2026"
    );
    assert.deepEqual(handleBijoyPaste("Note: ", "Room 2", 6, 6), {
      caret: 12,
      value: "Note: Room 2"
    });
  });

  it("replaces selected text with converted BIJOY paste", () => {
    const initial = "নাম: ___";

    assert.deepEqual(handleBijoyPaste(initial, "Avgvi", 5, 8), {
      caret: "নাম: আমার".length,
      value: "নাম: আমার"
    });
  });

  it("handles practical office examples", () => {
    assert.equal(typeBijoy("ivwng"), "রাহিম");
    assert.equal(typeBijoy("gvnv"), "মাহা");
    assert.equal(typeBijoy("evwo"), "বাড়ি");
    assert.equal(typeBijoy("K¬vm"), "ক্লাস");
    assert.equal(typeBijoy("A"), "অ");
  });
});
