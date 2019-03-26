import React, {useCallback, useMemo, useState} from 'react';
import {LocalizeContext, LocalizeContextValue, localizePolyglot} from './Instances';

/**
 * The `Phrases` object is either given to `setLanguage`, or returned from
 * `getPhrases`.
 */
export interface Phrases {
  [phrase: string]: string | Phrases;
}

export interface LocalizeProviderProps {
  /**
   * A function to fetch the `Phrases` object for a given language.
   */
  getPhrases?: (language: string) => Promise<Phrases>;
  /**
   * If true, will prevent the `LocalizeProvider` from caching `Phrases`
   * objects. Default: false.
   */
  noCache?: boolean;
}

export const LocalizeProvider: React.FC<LocalizeProviderProps> = ({children, getPhrases, noCache}) => {
  // The current localization language.
  const [currentLanguage, setCurrentLanguage] = useState<string>('');

  // The cache of phrases mapped to their language.
  const [cachedPhrases, setCachedPhrases] = useState<{[language: string]: Phrases}>({});

  // The current status of fetching languages.
  const [loading, setLoading] = useState<boolean>(true);

  // The current error status of fetching languages.
  const [error, setError] = useState<Error | null>(null);

  const isLanguageCached = useCallback((language: string) => language in cachedPhrases, [cachedPhrases]);

  const setLanguage = useCallback(
    async (language: string, phrases?: Phrases) => {
      try {
        // New language object will be either given object, fetched object, or
        // null. If new language object is not defined at this step, and there is
        // no cache for the language, then this statement will throw and the
        // language will not be set (no language object available).
        let newPhrases: Phrases | null = null;

        if (phrases) {
          newPhrases = phrases;
        } else if (!isLanguageCached(language) && getPhrases) {
          setLoading(true);
          newPhrases = await getPhrases(language);
        } else if (!isLanguageCached(language)) {
          throw new TypeError(
            `No phrases object provided, language ${language} is not cached,` +
              ` and the getPhrases prop is not provided.`,
          );
        } else {
          newPhrases = cachedPhrases[language];
        }

        // Update the current language.
        setCurrentLanguage(language);

        // Extend polyglot to use new language object or cached, and set locale.
        localizePolyglot.replace(newPhrases);
        localizePolyglot.locale(language);

        // Store new language object in the state if new object exists and no
        // cache is false.
        if (newPhrases && !noCache) {
          setCachedPhrases(previousState => ({
            ...previousState,
            [language]: newPhrases as Phrases,
          }));
        }
      } catch (error) {
        setError(error);
      }

      setLoading(false);
    },
    [cachedPhrases, getPhrases, isLanguageCached, noCache],
  );

  const clearCache = useCallback(
    (language?: string) => {
      if (language) {
        if (language in cachedPhrases) {
          const newState = {...cachedPhrases};
          delete newState[language];
          setCachedPhrases(newState);
        }
      } else {
        setCachedPhrases({});
      }
    },
    [cachedPhrases],
  );

  const value = useMemo<LocalizeContextValue>(
    () => ({
      loading,
      error,
      currentLanguage,
      setLanguage,
      isLanguageCached,
      clearCache,
      t: (phrase, options?) => localizePolyglot.t(phrase, options),
    }),
    [loading, error, currentLanguage, setLanguage, isLanguageCached, clearCache],
  );

  return <LocalizeContext.Provider value={value}>{children}</LocalizeContext.Provider>;
};
