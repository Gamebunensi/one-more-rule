import { useEffect, useRef } from "react";
import { trapFocus } from "../lib/focus";
import { Icon } from "./Icons";

export function SuccessDialog({ game, value, open, onRestart, onHome, onCopy, copied }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    window.setTimeout(() => dialogRef.current?.querySelector("button")?.focus(), 240);
    return () => previousFocus?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-layer success-layer">
      <section
        className="paper-dialog success-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        onKeyDown={(event) => trapFocus(event, dialogRef.current)}
      >
        <h2 id="success-title">{game.successTitle}</h2>
        <p>{game.successCopy}</p>
        <div className="final-answer">
          <span>{game.resultLabel}</span>
          <strong>{value}</strong>
        </div>
        <p className="completion-line"><strong>{game.rules.length} / {game.rules.length}</strong> 条要求全部满足</p>
        <img className="approval-stamp" src="./assets/approval-stamp.png" alt="审核通过印章" />
        <div className="success-actions">
          <button className="primary-button compact" type="button" onClick={onRestart}>再审一个</button>
          <button className="secondary-button" type="button" onClick={onHome}>返回游戏大厅</button>
          <button className="secondary-button" type="button" onClick={onCopy}>
            <Icon name="copy" size={19} /> {copied ? "已复制" : "复制战绩"}
          </button>
        </div>
      </section>
    </div>
  );
}
