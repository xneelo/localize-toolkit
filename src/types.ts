import Polyglot from 'node-polyglot';

/* --- Prop types --- */

export interface LocalizeProps {
  /**
   * The phrase string you wish to translate.
   */
  t: string;
  /**
   * Any options for the translated phrase. This acts the same as a second
   * argument given to Polyglot.
   */
  options?: number | Polyglot.InterpolationOptions;
  /**
   * A function that takes in the translated string and returns the string that
   * will be rendered by the component. For example, you can convert the
   * translated string to uppercase.
   * @param translated The translated string to transform.
   */
  transformString?(translated: string): string;
}

export interface LocalizeProviderProps {
  /**
   * A function to fetch the `Phrases` object for a given language.
   * @param language The language token to fetch.
   */
  getPhrases?(language: string): Promise<Phrases>;
  /**
   * If true, will prevent the `LocalizeProvider` from caching `Phrases`
   * objects. Default: false.
   */
  noCache?: boolean;
}

/* --- Other types --- */

/**
 * The `Phrases` object is either given to `setLanguage`, or returned from
 * `getPhrases`.
 */
export interface Phrases {
  [phrase: string]: string | Phrases;
}

export interface Translate {
  /**
   * Translate a phrase and provide any options for the localization.
   * @param phrase The phrase to translate.
   * @param options Optional. Polyglot options. Can be number for `smart_count` or interpolation.
   */
  t(phrase: string, options?: number | Polyglot.InterpolationOptions): string;
}

export interface LocalizeContextValue extends Translate {
  /**
   * True if phrases are being fetched.
   */
  loading: boolean;
  /**
   * Contains any errors from fetching or setting a language.
   */
  error: Error | null;
  /**
   * The current language string. Example: "en".
   */
  currentLanguage: string;
  /**
   * Returns true if language is currently cached by the Localize Provider.
   * @param language Language token (example: 'en').
   */
  isLanguageCached(language: string): boolean;
  /**
   * Set the current language, and provide an optional phrases object. If no
   * phrases object is provided, will attempt to fetch language using language
   * token from provided getPhrases API in the Provider.
   * @param language Language token (example: 'en').
   * @param phrases Optional. Object of phrases for the language.
   */
  setLanguage(language: string, phrases?: Phrases): Promise<void>;
  /**
   * Clears a cached language object. If no language is provided, clears the
   * entire cache of language objects.
   */
  clearCache(language?: string): void;
}
