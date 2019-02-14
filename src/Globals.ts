import React from 'react';
import Polyglot from 'node-polyglot';
import {Phrases} from './LocalizeProvider';

// Types

export interface Translate {
  /**
   * Translate a phrase and provide any options for the localization.
   * @param phrase The phrase to translate.
   * @param options Optional. Polyglot options. Can be smartcount or interpolation.
   */
  t(phrase: string, options?: number | Polyglot.InterpolationOptions): string;
}

export interface LocalizeContextValue extends Translate {
  /**
   * The current language string. Example: "en".
   */
  currentLanguage: string;
  /**
   * True if phrases are loaded, false if they are being fetched.
   */
  isLoaded: boolean;
  /**
   * Set the current language, and provide an optional phrases object. If no
   * phrases object is provided, will attempt to fetch language using language
   * token from provided getPhrases API in the Provider.
   * @param language Language token (example: 'en').
   * @param phrases Optional. Object of phrases for the language.
   */
  setLanguage(language: string, phrases?: Phrases): Promise<void>;
  /**
   * Returns true if language is currently cached by the Localize Provider.
   * @param language Language token (example: 'en').
   */
  isLanguageCached(language: string): boolean;
  /**
   * Clears a cached language object. If no language is provided, clears the
   * entire cache of language objects.
   */
  clearCache(language?: string): void;
}

// Values

/** Localize context instance. */
export const LocalizeContext = React.createContext<LocalizeContextValue>({
  currentLanguage: '',
  isLoaded: false,
  setLanguage: () => {
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
export const staticTranslate: Translate = {
  t: (phrase, options?) => localizePolyglot.t(phrase, options),
};
