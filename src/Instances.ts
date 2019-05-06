import Polyglot from 'node-polyglot';
import React from 'react';
import {LocalizeContextValue, Translate} from './types';

/** Localize context instance. */
export const LocalizeContext = React.createContext<LocalizeContextValue>({
  currentLanguage: '',
  loading: false,
  error: new Error('No provider'),
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
 * **WARNING**: Only use this in non-React files. This will create a static
 * translation and will not update when the language changes.
 *
 * Static translate object. Call `staticTranslate.t("phrase")` to receive a
 * static translation of the phrase.
 */
export const staticTranslate: Translate = {
  t: (phrase, options?) => localizePolyglot.t(phrase, options),
};
