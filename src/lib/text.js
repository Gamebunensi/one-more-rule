export const codePoints = (value) => Array.from(value.trim());

export const chineseCharacters = (value) =>
  codePoints(value).filter((character) => /[\u3400-\u9fff\uf900-\ufaff]/u.test(character));

export const chineseCount = (value) => chineseCharacters(value).length;

export const digitSum = (value) =>
  (value.match(/\d/g) || []).reduce((sum, digit) => sum + Number(digit), 0);

export const isPrime = (number) => {
  if (number < 2) return false;
  for (let divisor = 2; divisor * divisor <= number; divisor += 1) {
    if (number % divisor === 0) return false;
  }
  return true;
};

export const hasEmoji = (value) => /\p{Extended_Pictographic}/u.test(value);

export const isChineseOnly = (value) =>
  value.trim().length > 0 && codePoints(value).every((character) => /[\u3400-\u9fff\uf900-\ufaff]/u.test(character));
