import { GameIcon, Icon } from "./Icons";

export function Lobby({ games, completedGames, onSelect }) {
  return (
    <main className="lobby">
      <section className="lobby-hero" aria-labelledby="lobby-title">
        <div className="margin-line" aria-hidden="true" />
        <div>
          <h1 id="lobby-title">一条要求不难，<br />全部一起就难了。</h1>
          <p>三个中文规则怪谈。每满足一条，就会冒出下一条。</p>
        </div>
        <span className="proof-note" aria-hidden="true">再改亿点！</span>
      </section>

      <section className="game-picker" aria-labelledby="picker-title">
        <h2 id="picker-title">选择一个倒霉角色</h2>
        <div className="game-list">
          {games.map((game, index) => (
            <button
              className={`game-row ${index === 0 ? "featured" : ""}`}
              key={game.id}
              type="button"
              onClick={() => onSelect(game.id)}
            >
              <span className="game-number">{game.number}</span>
              <span className="game-illustration"><GameIcon name={game.icon} /></span>
              <span className="game-copy">
                <strong>{game.title}</strong>
                <span>{game.description}</span>
              </span>
              {completedGames.includes(game.id) && <span className="completed-mark"><Icon name="check" size={17} /> 已通关</span>}
              <span className="row-action">
                <span className="row-action-label">
                  <span className="row-action-default">{game.startLabel}</span>
                  <span className="row-action-hover" aria-hidden="true">Go Go Go</span>
                </span>
                <Icon name="arrow" size={22} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="lobby-footer">
        <span className="footer-check"><Icon name="check" size={18} /></span>
        所有游戏均在浏览器本地运行
      </footer>
    </main>
  );
}
