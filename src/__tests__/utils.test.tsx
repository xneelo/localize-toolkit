import {psuedoLetters, pseudoLocalize, vowels} from '../utils';

describe('utils', () => {
  // Silence verbose errors.
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args: string[]) => {
      if (/Error: Uncaught/.test(args[0])) return;
      originalError.call(console, ...args);
    };
  });
  afterAll(() => (console.error = originalError));

  it('pseudoLocalize "localizes" every valid char', () => {
    const vowel = ['a', psuedoLetters['a']];
    const consonant = ['B', psuedoLetters['B']];
    const invalid = ['?', '?'];

    const input = vowel[0] + consonant[0] + invalid[0];
    const output = '[' + vowel[1] + vowel[1] + vowel[1] + consonant[1] + invalid[1] + ']';

    expect(vowels.includes(vowel[0])).toBeTruthy();
    expect(vowels.includes(consonant[0])).toBeFalsy();
    expect(pseudoLocalize(input)).toBe(output);
  });
});
