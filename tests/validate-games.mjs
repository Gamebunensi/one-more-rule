import assert from "node:assert/strict";
import { games } from "../src/data/games.js";

assert.equal(games.length, 3, "应当有三个游戏");
assert.deepEqual(games.map((game) => game.rules.length), [18, 16, 18], "规则数量应与设计一致");
assert.equal(new Set(games.map((game) => game.id)).size, games.length, "游戏 id 必须唯一");

for (const game of games) {
  for (const rule of game.rules) {
    assert.equal(rule.test(game.winningText), true, `${game.title} 的通关文本未通过规则：${rule.text}`);
  }
}

console.log(`Validated ${games.length} games and ${games.reduce((sum, game) => sum + game.rules.length, 0)} rules.`);
