import { useMemo, useRef, useState } from "react";
import { chineseCount, codePoints } from "../lib/text";
import { Icon } from "./Icons";
import { RuleList } from "./RuleList";
import { SuccessDialog } from "./SuccessDialog";

export function GameScreen({ game, onHome, onComplete }) {
  const [value, setValue] = useState(game.initial);
  const [unlocked, setUnlocked] = useState(1);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const activeRules = useMemo(() => game.rules.slice(0, unlocked), [game, unlocked]);
  const failingRule = activeRules.find((rule) => !rule.test(value));
  const allActivePassed = !failingRule;

  const submit = () => {
    setAttempts((count) => count + 1);
    setShowHint(false);

    if (!allActivePassed) {
      setShake(false);
      window.requestAnimationFrame(() => setShake(true));
      return;
    }

    if (unlocked === game.rules.length) {
      setFinished(true);
      onComplete(game.id);
      return;
    }

    setUnlocked((count) => count + 1);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const restart = () => {
    setValue(game.initial);
    setUnlocked(1);
    setAttempts(0);
    setFinished(false);
    setCopied(false);
    setShowHint(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const useExample = () => {
    const next = (exampleIndex + 1) % game.examples.length;
    setExampleIndex(next);
    setValue(game.examples[next]);
    setShowHint(false);
    inputRef.current?.focus();
  };

  const copyResult = async () => {
    const text = `我通关了《${game.title}》：${value}（${game.rules.length}/${game.rules.length} 条要求）`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_error) {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    setCopied(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <main className="game-page">
      <section className="game-masthead">
        <div>
          <h1>{game.title}</h1>
          <p>{game.intro}</p>
        </div>
        <p className="progress-copy">第 <strong>{unlocked}</strong> / {game.rules.length} 条</p>
      </section>

      <div className="game-workspace">
        <section className={`writing-sheet ${shake ? "shake" : ""}`} onAnimationEnd={() => setShake(false)}>
          <label htmlFor={`game-input-${game.id}`}>{game.taskHeading}</label>
          <div className="editor-wrap">
            <textarea
              id={`game-input-${game.id}`}
              ref={inputRef}
              autoFocus
              enterKeyHint="go"
              maxLength={game.maxLength}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setShowHint(false);
              }}
              onKeyDown={handleKeyDown}
              aria-describedby="active-feedback"
            />
            <span className="character-count">
              {codePoints(value).length} / {game.maxLength} 字
              {game.id === "leave" && <small>（{chineseCount(value)} 个汉字）</small>}
            </span>
          </div>

          <div className={`active-feedback ${allActivePassed ? "ready" : "needs-work"}`} id="active-feedback" aria-live="polite">
            <span className="proof-arrow" aria-hidden="true">↳</span>
            <div>
              <strong>{allActivePassed ? "当前条件已满足" : failingRule.text}</strong>
              {allActivePassed ? (
                <span>提交后解锁下一条要求。</span>
              ) : (
                <>
                  <button type="button" onClick={() => setShowHint((visible) => !visible)}>
                    {showHint ? "收起提示" : "查看提示"}
                  </button>
                  {showHint && <span className="hint-copy">{failingRule.hint}</span>}
                </>
              )}
            </div>
          </div>

          <div className="editor-actions">
            <button className="primary-button" type="button" onClick={submit}>{game.actionLabel}</button>
            <button className="secondary-button" type="button" onClick={useExample}>换个示例</button>
            <button className="reset-button" type="button" onClick={restart}>
              <Icon name="reset" size={18} /> 重新开始
            </button>
          </div>
          <p className="keyboard-hint"><kbd>Enter</kbd> 提交 · <kbd>Shift + Enter</kbd> 换行</p>
        </section>

        <RuleList game={game} value={value} unlocked={unlocked} />
      </div>

      <footer className="game-footer">内容仅保存在你的浏览器中 · 已提交 {attempts} 次</footer>

      <SuccessDialog
        game={game}
        value={value}
        open={finished}
        onRestart={restart}
        onHome={onHome}
        onCopy={copyResult}
        copied={copied}
      />
    </main>
  );
}
