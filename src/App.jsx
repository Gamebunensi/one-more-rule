import { useEffect, useMemo, useState } from "react";
import { games, getGame } from "./data/games";
import { GameScreen } from "./components/GameScreen";
import { Header } from "./components/Header";
import { HelpDialog } from "./components/HelpDialog";
import { Lobby } from "./components/Lobby";

const readRoute = () => {
  const match = window.location.hash.match(/^#\/game\/([a-z-]+)$/u);
  return match && getGame(match[1]) ? match[1] : null;
};

const readCompletions = () => {
  try {
    return JSON.parse(window.localStorage.getItem("one-more-rule-completed") || "[]");
  } catch (_error) {
    return [];
  }
};

export default function App() {
  const [gameId, setGameId] = useState(readRoute);
  const [helpOpen, setHelpOpen] = useState(false);
  const [completedGames, setCompletedGames] = useState(readCompletions);
  const game = useMemo(() => (gameId ? getGame(gameId) : null), [gameId]);

  useEffect(() => {
    const onHashChange = () => setGameId(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openGame = (id) => {
    window.location.hash = `#/game/${id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    window.location.hash = "#/";
    setGameId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markComplete = (id) => {
    setCompletedGames((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      window.localStorage.setItem("one-more-rule-completed", JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      <Header screen={game ? "game" : "home"} onHome={goHome} onHelp={() => setHelpOpen(true)} />
      {game ? (
        <GameScreen key={game.id} game={game} onHome={goHome} onComplete={markComplete} />
      ) : (
        <Lobby games={games} completedGames={completedGames} onSelect={openGame} />
      )}
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
