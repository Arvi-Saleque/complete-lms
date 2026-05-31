import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  convertBijoyToUnicode,
  looksLikeBijoyText,
  normalizeBanglaText
} from "./bijoy-to-unicode";

describe("convertBijoyToUnicode", () => {
  it("leaves Unicode Bangla unchanged", () => {
    assert.equal(convertBijoyToUnicode("আমি বাংলা লিখি।"), "আমি বাংলা লিখি।");
  });

  it("leaves English unchanged", () => {
    assert.equal(convertBijoyToUnicode("Student name and address"), "Student name and address");
  });

  it("handles empty and null-like input safely", () => {
    assert.equal(convertBijoyToUnicode(""), "");
    assert.equal(convertBijoyToUnicode(null as unknown as string), "");
    assert.equal(normalizeBanglaText(null), null);
  });

  it("converts a common SutonnyMJ/Bijoy ANSI sample", () => {
    assert.equal(
      convertBijoyToUnicode("Avgvi †mvbvi evsjv, Avwg †Zvgvq fv‡jvevwm|"),
      "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।"
    );
  });

  it("preserves English while converting a BIJOY portion", () => {
    assert.equal(convertBijoyToUnicode("Student: Avgvi evsjv"), "Student: আমার বাংলা");
  });

  it("only normalizes strongly detected BIJOY text on the server path", () => {
    assert.equal(looksLikeBijoyText("Student name"), false);
    assert.equal(normalizeBanglaText("  Avgvi evsjv  "), "আমার বাংলা");
  });
});
