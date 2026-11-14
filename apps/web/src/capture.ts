export type CaptureQuality = "compatible" | "balanced" | "high";

const frameRates: Record<CaptureQuality, number> = { compatible: 15, balanced: 30, high: 60 };

export function displayMediaConstraints(quality: CaptureQuality, audio: boolean): DisplayMediaStreamOptions {
  const frameRate = frameRates[quality];
  return { video: { frameRate: { ideal: frameRate, max: frameRate }, width: { ideal: quality === "high" ? 1920 : 1280 }, height: { ideal: quality === "high" ? 1080 : 720 } }, audio };
}

export function captureErrorMessage(error: unknown): string {
  if (!(error instanceof DOMException)) return "Não foi possível iniciar o compartilhamento.";
  const messages: Record<string, string> = {
    AbortError: "A seleção de fonte foi cancelada.",
    InvalidStateError: "Volte para esta aba e tente iniciar o compartilhamento novamente.",
    NotAllowedError: "A captura foi negada. Autorize uma tela, janela ou aba no navegador.",
    NotFoundError: "Nenhuma fonte de captura está disponível neste dispositivo.",
    NotReadableError: "O sistema não permitiu ler essa fonte. Tente outra tela ou janela.",
    OverconstrainedError: "Esta fonte não aceita a qualidade selecionada. Tente o modo compatível."
  };
  return messages[error.name] ?? "Não foi possível iniciar o compartilhamento.";
}

/** Browser-tab audio is isolated from desktop applications such as Discord. */
export function keepOnlyTabAudio(stream: MediaStream): boolean {
  const surface = stream.getVideoTracks()[0]?.getSettings().displaySurface;
  if (surface === "browser") return true;
  stream.getAudioTracks().forEach((track) => track.stop());
  return false;
}

/** Checks only the local preview. Pixel data is never stored or transmitted. */
export function inspectLocalPreview(video: HTMLVideoElement): string | undefined {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return "A prévia ainda não recebeu frames da fonte selecionada.";
  try {
    const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 36;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return undefined;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let lit = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 8 || pixels[i + 1] > 8 || pixels[i + 2] > 8) lit += 1;
    return lit / (pixels.length / 4) < 0.002 ? "A prévia parece preta. O navegador ou Windows pode não expor frames desta fonte. Teste outra fonte ou modo gráfico." : undefined;
  } catch { return "Não foi possível analisar a prévia local, mas a transmissão pode continuar."; }
}
