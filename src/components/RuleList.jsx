import { Icon } from "./Icons";

export function RuleList({ game, value, unlocked }) {
  const visibleCount = Math.min(game.rules.length, unlocked + 3);

  return (
    <aside className="rule-panel" aria-label={game.rulesHeading}>
      <h2>{game.rulesHeading}</h2>
      <ol className="rule-list">
        {game.rules.slice(0, visibleCount).map((rule, index) => {
          const isUnlocked = index < unlocked;
          const passed = isUnlocked && rule.test(value);
          const isCurrent = index === unlocked - 1;
          const status = !isUnlocked ? "locked" : passed ? "passed" : "failed";

          return (
            <li className={`rule-row ${status} ${isCurrent ? "current" : ""}`} key={rule.id}>
              <span className="rule-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="rule-copy">
                <span>{isUnlocked ? rule.text : "满足后解锁下一条"}</span>
                {isUnlocked && <small>{rule.reviewer}</small>}
              </span>
              <span className="rule-status" aria-label={status === "passed" ? "已通过" : status === "failed" ? "未通过" : "未解锁"}>
                <Icon name={status === "passed" ? "check" : status === "failed" ? "close" : "lock"} size={21} />
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
