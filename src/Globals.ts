import * as React from 'react';
import * as Polyglot from 'node-polyglot';
import { IPhrases } from './LocalizeProvider';

// Types

export interface ILocalizeContextValue {
  setLanguage?: (language: string, languageObject?: IPhrases, shouldCache?: boolean) => Promise<void>;
  isLanguageCached?: (language: string) => boolean;
  clearCache?: (language?: string) => void;
  currentLanguage?: string;
  isLoaded?: boolean;
  t?(phrase: string): string;
  t?(phrase: string, smartCount: number): string;
  t?(phrase: string, interpolationOptions: Polyglot.InterpolationOptions): string;
}

export interface IStaticTranslate {
  t(phrase: string): string;
  t(phrase: string, smartCount: number): string;
  t(phrase: string, interpolationOptions: Polyglot.InterpolationOptions): string;
}

// Values

/** Localize context instance. */
export const LocalizeContext = React.createContext<ILocalizeContextValue>({});

/** Localize polyglot instance. */
export const localizePolyglot = new Polyglot();

/**
 * Static translate object. Call staticTranslate.t('token') to receive a static
 * translation of the token from the polyglot instance. This prevents
 * unintentional direct manipulation of the localize polyglot instance by only
 * exposing the t method.
 */
export const staticTranslate: IStaticTranslate = {
  /**
   * Polyglot t method to translate a phrase.
   * @param t Phrase token to translate.
   * @param options Optional. Smart count or interpolation options.
   */
  t: (phrase, options?) => localizePolyglot.t(phrase, options),
};
