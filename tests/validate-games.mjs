import assert from "node:assert/strict";
import { games } from "../src/data/games.js";

assert.equal(games.length, 3, "应当有三个游戏");
assert.deepEqual(games.map((game) => game.rules.length), [19, 17, 18], "规则数量应与设计一致");
assert.equal(new Set(games.map((game) => game.id)).size, games.length, "游戏 id 必须唯一");

for (const game of games) {
  for (const rule of game.rules) {
    assert.equal(rule.test(game.winningText, game.winningContext), true, `${game.title} 的通关文本未通过规则：${rule.text}`);
  }
}

const clientGame = games.find((game) => game.id === "client");
const redTextRule = clientGame.rules.find((gameRule) => gameRule.id === "c5");
assert.equal(redTextRule.test("文案中写了红色两个字", { redCharacterCount: 0 }), false, "写出“红色”不应冒充红色文字");
assert.equal(redTextRule.test("真正改变了文字颜色", { redCharacterCount: 1 }), true, "存在红色字符时应通过颜色规则");

const clientFluencyRule = clientGame.rules.find((gameRule) => gameRule.id === "c18");
assert.equal(clientFluencyRule.test("再改亿点AI2026创意一鸣惊人火遍全球🔥！"), false, "缺少连接关系的广告词不应通过通顺检查");
assert.equal(clientFluencyRule.test(clientGame.winningText), true, "完整广告语应通过通顺检查");

const leaveGame = games.find((game) => game.id === "leave");
const leaveFluencyRule = leaveGame.rules.find((gameRule) => gameRule.id === "l16");
assert.equal(leaveFluencyRule.test("王经理您好，谢谢批准，工作交接给小李，本周五休息壹天，周六补回。"), false, "顺序混乱的请假条不应通过通顺检查");
assert.equal(leaveFluencyRule.test(leaveGame.winningText), true, "合理语序的请假条应通过通顺检查");

const familyGame = games.find((game) => game.id === "family");
assert.equal(familyGame.rules.some((gameRule) => /通顺|语序/u.test(gameRule.text)), false, "家庭群昵称不应增加语句通顺检查");

console.log(`Validated ${games.length} games and ${games.reduce((sum, game) => sum + game.rules.length, 0)} rules.`);
