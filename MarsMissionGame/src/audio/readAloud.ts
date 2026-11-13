export function canReadAloud(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopReadAloud(): void {
  try {
    if (canReadAloud()) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // Ignore speech synthesis errors on restricted browsers
  }
}

export function speakText(text: string, onEnd?: () => void): boolean {
  try {
    if (!canReadAloud()) return false;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.96;
    utter.pitch = 1.04;
    if (onEnd) {
      utter.onend = onEnd;
      utter.onerror = onEnd;
    }
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}
