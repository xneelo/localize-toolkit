import React, {useState} from 'react';
import {LocalizeContext, LocalizeContextValue, localizePolyglot} from './Globals';

export interface Phrases {
  [phrase: string]: string | Phrases;
}

export interface LocalizeProviderProps {
  getPhrases?: (language: string) => Promise<Phrases>;
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

  const isLanguageCached = (language: string) => language in cachedPhrases;

  const setLanguage = async (language: string, phrases?: Phrases) => {
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
          `No language object provided, language ${language} is not cached,` +
            ` and the getPhrases prop is not provided.`,
        );
      } else {
        newPhrases = cachedPhrases[language];
      }

      // Update the current language.
      setCurrentLanguage(language);

      // Clear current mapped language in polyglot.
      localizePolyglot.clear();

      // Extend polyglot to use new language object or cached, and set locale.
      localizePolyglot.extend(newPhrases);
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
  };

  const clearCache = (language?: string) => {
    if (language) {
      if (language in cachedPhrases) {
        const newState = {...cachedPhrases};
        delete newState[language];
        setCachedPhrases(newState);
      }
    } else {
      setCachedPhrases({});
    }
  };

  // Provider value
  const value: LocalizeContextValue = {
    loading,
    error,
    currentLanguage,
    setLanguage,
    isLanguageCached,
    clearCache,
    t: (phrase, options?) => localizePolyglot.t(phrase, options),
  };

  return <LocalizeContext.Provider value={value}>{children}</LocalizeContext.Provider>;
};
