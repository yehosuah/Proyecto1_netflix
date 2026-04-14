import { useEffect, useRef } from "react";

function extractVoiceLabel(target) {
  if (!(target instanceof HTMLElement)) {
    return "";
  }

  const focusTarget = target.closest("[data-voice]");

  if (focusTarget instanceof HTMLElement) {
    return (
      focusTarget.dataset.voice ||
      focusTarget.getAttribute("aria-label") ||
      focusTarget.textContent ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  return (
    target.getAttribute("aria-label") ||
    target.getAttribute("placeholder") ||
    target.textContent ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function useVoiceGuidance({ enabled, routeMessage }) {
  const lastMessageRef = useRef("");

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
      return undefined;
    }

    if (!routeMessage || routeMessage === lastMessageRef.current) {
      return undefined;
    }

    const utterance = new SpeechSynthesisUtterance(routeMessage);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    lastMessageRef.current = routeMessage;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [enabled, routeMessage]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
      return undefined;
    }

    let focusTimeout = 0;

    const handleFocus = (event) => {
      const label = extractVoiceLabel(event.target);

      if (!label || label === lastMessageRef.current) {
        return;
      }

      window.clearTimeout(focusTimeout);
      focusTimeout = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(label);
        utterance.lang = "es-ES";
        utterance.rate = 0.98;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        lastMessageRef.current = label;
      }, 90);
    };

    window.addEventListener("focusin", handleFocus);

    return () => {
      window.clearTimeout(focusTimeout);
      window.removeEventListener("focusin", handleFocus);
      window.speechSynthesis.cancel();
    };
  }, [enabled]);
}
