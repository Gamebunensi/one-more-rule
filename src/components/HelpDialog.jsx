import { useEffect, useRef } from "react";
import { trapFocus } from "../lib/focus";
import { Icon } from "./Icons";

export function HelpDialog({ open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    window.setTimeout(() => dialogRef.current?.querySelector("button")?.focus(), 0);
    return () => previousFocus?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="paper-dialog help-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onKeyDown={(event) => trapFocus(event, dialogRef.current)}
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="关闭玩法说明">
          <Icon name="close" />
        </button>
        <h2 id="help-title">怎么玩？</h2>
        <p>先输入一段文字，满足当前出现的要求，再提交解锁下一条。</p>
        <ol>
          <li>所有已经出现的要求必须同时保持通过。</li>
          <li>新要求可能让你不得不推翻刚才的写法。</li>
          <li>需要颜色或表情时，对应的编辑工具会随规则一起解锁。</li>
          <li><kbd>Enter</kbd> 提交，<kbd>Shift</kbd> + <kbd>Enter</kbd> 换行。</li>
          <li>卡住时可以查看当前红色要求下面的提示。</li>
        </ol>
        <p className="privacy-copy">内容只保存在当前浏览器中，请不要输入真实隐私信息。</p>
        <button className="primary-button compact" type="button" onClick={onClose}>知道了</button>
      </section>
    </div>
  );
}
