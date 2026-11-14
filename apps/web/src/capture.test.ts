import { describe, expect, it, vi } from "vitest";
import { captureErrorMessage, displayMediaConstraints, keepOnlyTabAudio } from "./capture";

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
  it("removes audio from screen and window sources", () => {
    const stop = vi.fn();
    const stream = { getVideoTracks: () => [{ getSettings: () => ({ displaySurface: "monitor" }) }], getAudioTracks: () => [{ stop }] } as unknown as MediaStream;
    expect(keepOnlyTabAudio(stream)).toBe(false);
    expect(stop).toHaveBeenCalledOnce();
  });
  it("keeps audio from a browser tab", () => {
    const stop = vi.fn();
    const stream = { getVideoTracks: () => [{ getSettings: () => ({ displaySurface: "browser" }) }], getAudioTracks: () => [{ stop }] } as unknown as MediaStream;
    expect(keepOnlyTabAudio(stream)).toBe(true);
    expect(stop).not.toHaveBeenCalled();
  });
});
