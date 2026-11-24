import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { typingSnippets } from "../data/portfolio";

function calculateStats(typedText, sourceText, elapsedSeconds, isComplete = false) {
  let correctCharacters = 0;

  for (let index = 0; index < typedText.length && index < sourceText.length; index += 1) {
    if (typedText[index] === sourceText[index]) correctCharacters += 1;
  }

  const seconds = Math.max(elapsedSeconds, isComplete ? 1 : 0.6);
  const minutes = seconds / 60;
  const wpm = typedText.length ? Math.max(0, Math.round(correctCharacters / 5 / minutes)) : 0;
  const raw = typedText.length ? Math.max(0, Math.round(typedText.length / 5 / minutes)) : 0;
  const accuracy = typedText.length ? Math.round((correctCharacters / typedText.length) * 100) : 100;

  return { accuracy, correctCharacters, raw, wpm };
}

function resultMessage(wpm) {
  if (wpm >= 60) return "great code speed — keep shipping!";
  if (wpm >= 35) return "nice typing — your code flow is solid";
  if (wpm >= 20) return "good start — keep practicing your snippets";
  return "keep going — speed comes with clean code reps";
}

export function TypingTest({
  isOpen,
  dismissResultSignal,
  onResultVisibilityChange,
}) {
  const [snippet, setSnippet] = useState(typingSnippets[0]);
  const [typedText, setTypedText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const inputRef = useRef(null);
  const lastDismissSignal = useRef(dismissResultSignal);

  const resetTest = useCallback(() => {
    const nextSnippet = typingSnippets[Math.floor(Math.random() * typingSnippets.length)];

    setSnippet(nextSnippet);
    setTypedText("");
    setElapsedSeconds(0);
    setHasStarted(false);
    setIsComplete(false);
    setIsResultVisible(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsResultVisible(false);
      return;
    }

    resetTest();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen, resetTest]);

  useEffect(() => {
    if (!isOpen || !hasStarted || isComplete) return undefined;

    const timerId = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [hasStarted, isComplete, isOpen]);

  useEffect(() => {
    onResultVisibilityChange(isResultVisible);
  }, [isResultVisible, onResultVisibilityChange]);

  useEffect(() => {
    if (dismissResultSignal === lastDismissSignal.current) return;

    lastDismissSignal.current = dismissResultSignal;
    setIsResultVisible(false);
  }, [dismissResultSignal]);

  useEffect(() => {
    if (!isOpen || !isResultVisible) return undefined;

    function handleKeyDown(event) {
      if (event.key !== "Tab") return;

      event.preventDefault();
      resetTest();
      requestAnimationFrame(() => inputRef.current?.focus());
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isResultVisible, resetTest]);

  const stats = useMemo(
    () => calculateStats(typedText, snippet, elapsedSeconds, isComplete),
    [elapsedSeconds, isComplete, snippet, typedText],
  );

  function handleInput(event) {
    const nextValue = event.target.value.slice(0, snippet.length);

    if (!hasStarted && nextValue.length > 0) setHasStarted(true);
    setTypedText(nextValue);

    if (nextValue.length === snippet.length) {
      setIsComplete(true);
      setIsResultVisible(true);
    }
  }

  function restartAndFocus() {
    resetTest();
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <>
      <div className="typing-card">
        <pre className="typing-text" aria-live="polite">
          {Array.from(snippet).map((character, index) => {
            let state = "pending";

            if (index < typedText.length) {
              state = typedText[index] === character ? "correct" : "incorrect";
            }

            return (
              <span className={state} key={`${character}-${index}`}>
                {character}
              </span>
            );
          })}
        </pre>

        <textarea
          ref={inputRef}
          className="typing-input"
          rows="4"
          value={typedText}
          disabled={isComplete}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder="Start typing..."
          onChange={handleInput}
        />

        <div className="typing-stats">
          <span>
            WPM: <b>{stats.wpm}</b>
          </span>
          <span>
            Accuracy: <b>{stats.accuracy}%</b>
          </span>
          <span>
            Time: <b>{elapsedSeconds}s</b>
          </span>
        </div>

        <button className="typing-restart" type="button" onClick={restartAndFocus}>
          restart
        </button>
      </div>

      <div
        className={`typing-result${isResultVisible ? "" : " hidden"}`}
        role="dialog"
        aria-modal="false"
        aria-label="Typing results"
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsResultVisible(false);
        }}
      >
        <div className="typing-result-hints">
          <span>
            <kbd>tab</kbd> restart
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
        <div className="typing-result-wpm">{stats.wpm}</div>
        <p className="typing-result-label">words per minute</p>
        <div className="typing-result-stats">
          <div>
            <b>{stats.accuracy}%</b>
            <span>accuracy</span>
          </div>
          <div>
            <b>{stats.raw}</b>
            <span>raw</span>
          </div>
          <div>
            <b>{Math.max(elapsedSeconds, 1)}s</b>
            <span>time</span>
          </div>
        </div>
        <p className="typing-result-msg">{resultMessage(stats.wpm)}</p>
        <button className="typing-result-try" type="button" onClick={restartAndFocus}>
          ↻ try again
        </button>
      </div>
    </>
  );
}
