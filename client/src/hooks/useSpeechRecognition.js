import { useRef, useState, useCallback } from "react";

/**
 * Wraps the browser's built-in SpeechRecognition (Web Speech API).
 * Works best in Chrome / Edge. Returns transcribed text via onResult.
 * `lang` is a BCP-47 code like "en-US" or "hi-IN", chosen by the user
 * in the UI so voice input works correctly across languages.
 */
export function useSpeechRecognition(onResult, lang = "en-US") {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const startListening = useCallback(() => {
    if (!isSupported) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error("SpeechRecognition error:", event.error);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        alert(
          "Microphone access was blocked. Check your browser's site permissions AND your OS microphone privacy settings."
        );
      } else if (event.error === "no-speech") {
        // user just didn't say anything — no need to alert
      } else {
        alert(`Voice input error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [isSupported, onResult, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { startListening, stopListening, isListening, isSupported };
}