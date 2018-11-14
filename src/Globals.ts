import * as React from 'react';
import * as Polyglot from 'node-polyglot';
import { IPhrases } from './LocalizeProvider';

// Types

export interface ITranslate {
  t(phrase: string): string;
  t(phrase: string, smartCount: number): string;
  t(phrase: string, interpolationOptions: Polyglot.InterpolationOptions): string;
}

export interface ILocalizeContextValue extends ITranslate {
  currentLanguage: string;
  isLoaded: boolean;
  setLanguage(language: string, languageObject?: IPhrases, shouldCache?: boolean): Promise<void>;
  isLanguageCached(language: string): boolean;
  clearCache(language?: string): void;
}

// Values

/** Localize context instance. */
export const LocalizeContext = React.createContext<ILocalizeContextValue>({
  currentLanguage: '',
  isLoaded: false,
  setLanguage: async () => {
    throw new Error('No provider');
  },
  isLanguageCached: () => {
    throw new Error('No provider');
  },
  clearCache: () => {
    throw new Error('No provider');
  },
  t: () => {
    throw new Error('No provider');
  },
});

/** Localize polyglot instance. */
export const localizePolyglot = new Polyglot();

/**
 * **NOTE**: Only use this in non-React files. This will create a static
 * translation and will not update when the language changes.
 *
 * Static translate object. Call `staticTranslate.t("phrase")` to receive a
 * static translation of the phrase.
 */
export const staticTranslate: ITranslate = {
  t: (phrase, options?) => localizePolyglot.t(phrase, options),
};
