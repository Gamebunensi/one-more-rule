import { Icon } from "./Icons";

export function Header({ screen, onHome, onHelp }) {
  return (
    <header className="site-header">
      <button className="brand-button" type="button" onClick={onHome} aria-label="返回再改亿点游戏大厅">
        再改亿点
      </button>

      {screen === "home" ? (
        <nav className="site-nav" aria-label="主导航">
          <button className="nav-link active" type="button" onClick={onHome}>游戏大厅</button>
          <button className="nav-link" type="button" onClick={onHelp}>玩法说明</button>
          <a className="nav-link" href="https://github.com/Gamebunensi/one-more-rule" target="_blank" rel="noreferrer">
            GitHub <Icon name="external" size={17} />
          </a>
        </nav>
      ) : (
        <div className="game-header-actions">
          <button className="back-link" type="button" onClick={onHome}>
            <Icon name="back" size={23} /> 返回游戏大厅
          </button>
          <button className="help-link" type="button" onClick={onHelp}>
            <Icon name="help" size={22} /> 玩法说明
          </button>
        </div>
      )}
    </header>
  );
}
