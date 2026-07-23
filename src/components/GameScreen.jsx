import { useMemo, useRef, useState } from "react";
import { chineseCount, codePoints } from "../lib/text";
import { Icon } from "./Icons";
import { RuleList } from "./RuleList";
import { SuccessDialog } from "./SuccessDialog";

const RED_TEXT_COLOR = "#e0202d";
const DEFAULT_TEXT_COLOR = "#071a3d";
const EMPTY_FORMAT_STATE = Object.freeze({ redCharacterCount: 0 });
const CLIENT_EMOJIS = ["🔥", "✨", "🚀", "🎉"];

const readEditorText = (editor) => editor.innerText.replace(/\r/gu, "");

const isRedText = (element) => {
  const channels = window.getComputedStyle(element).color.match(/\d+/gu)?.map(Number);
  return channels?.[0] === 224 && channels?.[1] === 32 && channels?.[2] === 45;
};

const countRedCharacters = (editor) => {
  const walker = document.createTreeWalker(editor, window.NodeFilter.SHOW_TEXT);
  let count = 0;
  let node = walker.nextNode();

  while (node) {
    if (node.parentElement && isRedText(node.parentElement)) {
      count += Array.from(node.nodeValue || "").filter((character) => !/\s/u.test(character)).length;
    }
    node = walker.nextNode();
  }

  return count;
};

const rangeBelongsToEditor = (range, editor) =>
  range.commonAncestorContainer === editor || editor.contains(range.commonAncestorContainer);

const placeCaretAtEnd = (editor) => {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

export function GameScreen({ game, onHome, onComplete }) {
  const [value, setValue] = useState(game.initial);
  const [formatState, setFormatState] = useState(EMPTY_FORMAT_STATE);
  const [unlocked, setUnlocked] = useState(1);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toolNotice, setToolNotice] = useState("");
  const inputRef = useRef(null);
  const savedRangeRef = useRef(null);

  const activeRules = useMemo(() => game.rules.slice(0, unlocked), [game, unlocked]);
  const failingRule = activeRules.find((rule) => !rule.test(value, formatState));
  const allActivePassed = !failingRule;
  const usesRichEditor = game.editorMode === "rich-text";
  const colorToolUnlocked = usesRichEditor && unlocked >= game.editorTools.color;
  const emojiToolUnlocked = usesRichEditor && unlocked >= game.editorTools.emoji;

  const replaceEditorValue = (nextValue) => {
    if (usesRichEditor && inputRef.current) inputRef.current.textContent = nextValue;
    setValue(nextValue);
    setFormatState(EMPTY_FORMAT_STATE);
    setToolNotice("");
    savedRangeRef.current = null;
  };

  const rememberSelection = () => {
    if (!usesRichEditor || !inputRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (rangeBelongsToEditor(range, inputRef.current)) savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const editor = inputRef.current;
    if (!editor) return null;
    editor.focus();

    const selection = window.getSelection();
    const savedRange = savedRangeRef.current;
    if (savedRange && rangeBelongsToEditor(savedRange, editor)) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
      return savedRange;
    }

    placeCaretAtEnd(editor);
    return selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  };

  const syncRichEditor = () => {
    const editor = inputRef.current;
    if (!editor) return;

    let nextValue = readEditorText(editor);
    if (Array.from(nextValue).length > game.maxLength) {
      nextValue = Array.from(nextValue).slice(0, game.maxLength).join("");
      editor.textContent = nextValue;
      placeCaretAtEnd(editor);
    }

    const redCharacterCount = countRedCharacters(editor);
    setValue(nextValue);
    setFormatState((current) =>
      current.redCharacterCount === redCharacterCount ? current : { redCharacterCount },
    );
    rememberSelection();
  };

  const applyTextColor = (color) => {
    const editor = inputRef.current;
    const range = restoreSelection();
    if (!editor || !range || range.collapsed || !range.toString().trim()) {
      setToolNotice("请先在文案中选中要修改颜色的文字。");
      return;
    }

    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, color);

    placeCaretAtEnd(editor);
    const selection = window.getSelection();
    if (selection?.rangeCount) savedRangeRef.current = selection.getRangeAt(0).cloneRange();

    syncRichEditor();
    setToolNotice(color === RED_TEXT_COLOR ? "已把选中文字标为红色。" : "已恢复为默认文字颜色。");
  };

  const insertTextAtCaret = (text) => {
    const editor = inputRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;

    const selectedLength = Array.from(range.toString()).length;
    const availableLength = game.maxLength - (Array.from(readEditorText(editor)).length - selectedLength);
    const allowedText = Array.from(text).slice(0, Math.max(0, availableLength)).join("");
    if (!allowedText) {
      setToolNotice(`最多只能输入 ${game.maxLength} 个字符。`);
      return;
    }

    const inserted = document.execCommand("insertText", false, allowedText);
    if (!inserted) {
      range.deleteContents();
      const textNode = document.createTextNode(allowedText);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    syncRichEditor();
    setToolNotice(`已插入 ${allowedText}`);
  };

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
    replaceEditorValue(game.initial);
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
    replaceEditorValue(game.examples[next]);
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
            {usesRichEditor ? (
              <div
                id={`game-input-${game.id}`}
                ref={inputRef}
                className="rich-text-input"
                contentEditable
                role="textbox"
                aria-label={game.taskHeading}
                aria-multiline="true"
                aria-describedby="active-feedback editor-tool-status"
                autoFocus
                enterKeyHint="go"
                spellCheck="false"
                suppressContentEditableWarning
                onInput={() => {
                  syncRichEditor();
                  setShowHint(false);
                  setToolNotice("");
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={rememberSelection}
                onMouseUp={rememberSelection}
                onPointerUp={rememberSelection}
                onPaste={(event) => {
                  event.preventDefault();
                  insertTextAtCaret(event.clipboardData.getData("text/plain"));
                }}
                onDrop={(event) => event.preventDefault()}
              >
                {game.initial}
              </div>
            ) : (
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
            )}
            <span className="character-count">
              {codePoints(value).length} / {game.maxLength} 字
              {game.id === "leave" && <small>（{chineseCount(value)} 个汉字）</small>}
            </span>
          </div>

          {(colorToolUnlocked || emojiToolUnlocked) && (
            <div className="editor-tools" aria-label="文案编辑工具">
              {colorToolUnlocked && (
                <div className="editor-tool-group">
                  <span className="editor-tool-label">文字颜色</span>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyTextColor(RED_TEXT_COLOR)}>
                    <span className="red-swatch" aria-hidden="true" /> 标为红色
                  </button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyTextColor(DEFAULT_TEXT_COLOR)}>
                    恢复默认
                  </button>
                  {formatState.redCharacterCount > 0 && <span className="format-count">已标红 {formatState.redCharacterCount} 字</span>}
                </div>
              )}
              {emojiToolUnlocked && (
                <div className="editor-tool-group emoji-tools">
                  <span className="editor-tool-label">插入表情</span>
                  {CLIENT_EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      className={emoji === "🔥" ? "required-emoji" : ""}
                      key={emoji}
                      aria-label={`插入表情 ${emoji}`}
                      title={emoji === "🔥" ? "插入火焰（当前规则需要）" : `插入 ${emoji}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => insertTextAtCaret(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <p className="editor-tool-status" id="editor-tool-status" aria-live="polite">
                {toolNotice || (colorToolUnlocked ? "先选中文字，再使用颜色按钮。" : "点击表情即可插入到光标位置。")}
              </p>
            </div>
          )}

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

        <RuleList game={game} value={value} formatState={formatState} unlocked={unlocked} />
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
