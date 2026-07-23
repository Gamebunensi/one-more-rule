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

const hasBrokenSentenceShape = (value) => {
  const text = value.trim();
  return (
    text.length === 0 ||
    /([，。！？、；：,.!?])\1/u.test(text) ||
    /([^\s])\1{2,}/u.test(text) ||
    /\s{2,}/u.test(text) ||
    /^[，。！？、；：,.!?]/u.test(text)
  );
};

export const isClientCopyFluent = (value) => {
  const text = value.trim();
  if (hasBrokenSentenceShape(text)) return false;

  const hasClearSubject = text.startsWith("再改亿点");
  const hasIdea = text.includes("创意");
  const forwardResult = /(?:让|将|会|能|使|以|凭|助)[^！。]{0,16}一鸣惊人[^！。]{0,12}(?:并|且|再|也)?[^！。]{0,8}火遍全球/u.test(text);
  const reverseResult = /(?:让|将|会|能|使|以|凭|助)[^！。]{0,16}火遍全球[^！。]{0,12}(?:并|且|再|也)?[^！。]{0,8}一鸣惊人/u.test(text);

  return hasClearSubject && hasIdea && (forwardResult || reverseResult);
};

export const isLeaveRequestFluent = (value) => {
  const text = value.trim();
  if (hasBrokenSentenceShape(text)) return false;

  return /^(?:[^，。]{0,4})?(?:经理|领导)您好，[^。]*本周五[^。]*休息壹天，[^。]*工作[^。]*交接[^。]*小李，[^。]*周六补回，[^。]*谢谢[^。]*批准。$/u.test(text);
};
