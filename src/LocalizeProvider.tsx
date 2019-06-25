import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {LocalizeContext, localizePolyglot} from './Instances';
import {LocalizeContextValue, LocalizeProviderProps, Phrases} from './types';

export const LocalizeProvider: React.FC<LocalizeProviderProps> = ({children, getPhrases, noCache}) => {
  // Ref for function to prevent reloading if arrow.
  const getPhrasesRef = useRef(getPhrases);

  // The current localization language.
  const [currentLanguage, setCurrentLanguage] = useState<string>('');

  // The cache of phrases mapped to their language.
  const [cachedPhrases, setCachedPhrases] = useState<{[language: string]: Phrases}>({});
  const cachedPhrasesRef = useRef(cachedPhrases);

  // The current status of fetching languages.
  const [loading, setLoading] = useState<boolean>(true);

  // The current error status of fetching languages.
  const [error, setError] = useState<Error | null>(null);

  // Keep refs up to date.
  useEffect(() => {
    getPhrasesRef.current = getPhrases;
    cachedPhrasesRef.current = cachedPhrases;
  });

  const isLanguageCached = useCallback((language: string) => language in cachedPhrasesRef.current, []);

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
        } else if (!isLanguageCached(language) && getPhrasesRef.current) {
          setLoading(true);
          newPhrases = await getPhrasesRef.current(language);
        } else if (!isLanguageCached(language)) {
          throw new TypeError(
            `No phrases object provided, language ${language} is not cached,` +
              ` and the getPhrases prop is not provided.`,
          );
        } else {
          newPhrases = cachedPhrasesRef.current[language];
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
    [isLanguageCached, noCache],
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
