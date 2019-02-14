import React, {useState, useEffect} from 'react';
import {localizePolyglot, LocalizeContext, LocalizeContextValue} from './Globals';

enum ProviderStatus {
  Loading = 'loading',
  Loaded = 'loaded',
}

export interface Phrases {
  [phrase: string]: string | Phrases;
}

export interface LocalizeProviderProps {
  initialLanguage?: string;
  initialPhrases?: Phrases;
  getPhrases?: (language: string) => Promise<Phrases>;
  onFailed?: (error: Error) => void;
  loadingComponent?: React.ReactNode;
  noCache?: boolean;
}

export const LocalizeProvider: React.SFC<LocalizeProviderProps> = ({
  children,
  initialLanguage,
  initialPhrases,
  getPhrases,
  onFailed,
  loadingComponent,
  noCache,
}) => {
  // The current localization language.
  const [currentLanguage, setCurrentLanguage] = useState<string>('');

  // The cache of phrases mapped to their language.
  const [cachedPhrases, setCachedPhrases] = useState<{[language: string]: Phrases}>({});

  // The current status of fetching languages from getPhrases.
  const [status, setStatus] = useState<ProviderStatus>(ProviderStatus.Loading);

  const isLanguageCached = (language: string) => language in cachedPhrases;

  const setLanguage = async (language: string, phrases?: Phrases) => {
    // New language object will be either given object, fetched object, or
    // null. If new language object is not defined at this step, and there is
    // no cache for the language, then this statement will throw and the
    // language will not be set (no language object available).
    try {
      let newPhrases: Phrases | null = null;
      if (phrases) {
        newPhrases = phrases;
      } else if (!isLanguageCached(language) && getPhrases) {
        setStatus(ProviderStatus.Loading);
        newPhrases = await getPhrases(language);
      } else if (!isLanguageCached(language)) {
        throw new Error(
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
      if (onFailed) onFailed(error);
    }

    setStatus(ProviderStatus.Loaded);
  };

  // Call setLanguage on component mount if initial language provided.
  // Will also set language if either initialLanguage or initialPhrases changes.
  useEffect(() => {
    if (!currentLanguage && initialLanguage) setLanguage(initialLanguage, initialPhrases);
  }, [initialLanguage, initialPhrases]);

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
    currentLanguage,
    isLoaded: status === ProviderStatus.Loaded,
    setLanguage,
    isLanguageCached,
    clearCache,
    t: (phrase, options?) => localizePolyglot.t(phrase, options),
  };

  return (
    <LocalizeContext.Provider value={value}>
      {status === ProviderStatus.Loading && loadingComponent ? loadingComponent : children}
    </LocalizeContext.Provider>
  );
};
