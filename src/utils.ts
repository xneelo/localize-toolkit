export const vowels = ['a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U', 'y', 'Y'];

/**
 * @see https://hg.mozilla.org/mozreview/gecko/rev/a96cf6ff334617c3d51e325ece5f27eaa0fefac9#index_header
 */
export const psuedoLetters: {[letter: string]: string} = {
  a: 'ȧ',
  A: 'Ȧ',
  b: 'ƀ',
  B: 'Ɓ',
  c: 'ƈ',
  C: 'Ƈ',
  d: 'ḓ',
  D: 'Ḓ',
  e: 'ḗ',
  E: 'Ḗ',
  f: 'ƒ',
  F: 'Ƒ',
  g: 'ɠ',
  G: 'Ɠ',
  h: 'ħ',
  H: 'Ħ',
  i: 'ī',
  I: 'Ī',
  j: 'ĵ',
  J: 'Ĵ',
  k: 'ķ',
  K: 'Ķ',
  l: 'ŀ',
  L: 'Ŀ',
  m: 'ḿ',
  M: 'Ḿ',
  n: 'ƞ',
  N: 'Ƞ',
  o: 'ǿ',
  O: 'Ǿ',
  p: 'ƥ',
  P: 'Ƥ',
  q: 'ɋ',
  Q: 'Ɋ',
  r: 'ř',
  R: 'Ř',
  s: 'ş',
  S: 'Ş',
  t: 'ŧ',
  T: 'Ŧ',
  v: 'ŭ',
  V: 'Ŭ',
  u: 'ṽ',
  U: 'Ṽ',
  w: 'ẇ',
  W: 'Ẇ',
  x: 'ẋ',
  X: 'Ẋ',
  y: 'ẏ',
  Y: 'Ẏ',
  z: 'ẑ',
  Z: 'Ẑ',
};

export const pseudoLocalize = (word: string) =>
  `[${word.replace(/./g, char => {
    const isVowel = vowels.includes(char);
    const pseudoString = psuedoLetters[char];
    return isVowel ? `${pseudoString}${pseudoString}${pseudoString}` : pseudoString || char;
  })}]`;
