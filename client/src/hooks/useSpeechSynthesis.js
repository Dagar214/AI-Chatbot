/**
 * Simple wrapper around the browser's built-in SpeechSynthesis (TTS).
 * No hook state needed since we just fire-and-forget speech.
 * `lang` is a BCP-47 code like "en-US" or "hi-IN". If the browser has
 * no voice installed for that language, it silently falls back to a
 * default voice rather than failing.
 */
export function speakText(text, lang = "en-US") {
  if (!window.speechSynthesis) return;

  // Stop anything currently being spoken before starting new speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}