import { describe, expect, it } from "vitest";
import { captureErrorMessage, displayMediaConstraints } from "./capture";

describe("capture configuration", () => {
  it("uses only preference constraints for compatible capture", () => {
    expect(displayMediaConstraints("compatible", false)).toEqual({ video: { frameRate: { ideal: 15, max: 15 }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  });
  it("requests high quality without forcing an exact source", () => {
    expect(displayMediaConstraints("high", true)).toEqual({ video: { frameRate: { ideal: 60, max: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: true });
  });
  it("explains a system capture lockout", () => {
    expect(captureErrorMessage(new DOMException("", "NotReadableError"))).toContain("sistema");
  });
});
