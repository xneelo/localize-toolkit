# OPF Localize

A localization library that uses React's context API and the Polyglot
localization library to provide a robust localization tool for React projects.

---

<details><summary>Table of contents</summary>

- [LocalizeProvider](#localizeprovider)
  - [LocalizeProvider Props](#localizeprovider-props)
    - [initLanguage](#initlanguage)
    - [initLanguageObject](#initlanguageobject)
    - [getLanguage](#getlanguage)
    - [onFailed](#onfailed)
    - [loadingComponent](#loadingcomponent)
  - [Example Initialization](#example-initialization)
- [LocalizeContext](#localizecontext)
  - [LocalizeContext API](#localizecontext-api)
    - [t](#t)
    - [setLanguage](#setlanguage)
    - [isLanguageCached](#islanguagecached)
    - [clearCache](#clearcache)
    - [currentLanguage](#currentlanguage)
    - [isLoaded](#isloaded)
  - [Example Use](#example-use)
    - [Functional Component](#functional-component)
    - [Class Component](#class-component)
- [Localize](#localize)
  - [Localize Props](#localize-props)
    - [t](#t-1)
    - [options](#options)
    - [isUpper](#isUpper)
    - [isLower](#isLower)
  - [Example Component](#example-component)
- [staticTranslate](#statictranslate)

</details>

---

**Features**:

1. Loading placeholder prop while language is being fetched
1. Reloading of every translated phrase upon language switch without remounting
   any components
1. Language map object cache to avoid repeat fetching
1. Static localization method for non-React files

**Exported Members**:

1. **LocalizeProvider**
   - The provider for the localize context
1. **LocalizeContext**
   - The context for use within Components
1. **Localize**
   - A consumer wrapped in a React component for ease of use
1. **staticTranslate**
   - Provides translation functionality outside of React components

## LocalizeProvider

Localize provider contains the core functionality, and provides localize methods
to both the [LocalizeContext](#localizecontext) and the [Localize](#localize)
component.

### LocalizeProvider Props

```ts
interface ILocalizeProviderProps {
  initLanguage?: string;
  initLanguageObject?: ILanguageObject;
  getLanguage?: (language: string) => ILanguageObject;
  onFailed?: (error: Error) => any;
  loadingComponent?: React.ReactNode;
}
```

#### initLanguage

- Provide the initial language string. If used with
  [initLanguageObject](#initlanguageobject), will set language and use the
  object for mapping phrases. Otherwise, will call [getLanguage](#getlanguage)
  API endpoint if provided.

#### initLanguageObject

- If [initLanguage](#initlanguage) is provided, this prop can be given to
  provide a language object for mapping phrases. Otherwise an API call to
  [getLanguage](#getlanguage) will be made with the initial language.

#### getLanguage

- Provide this prop to give an API endpoint that can be called with language.
  This should return a language object for mapping phrases.

#### onFailed

- Callback for when switching a language fails. This could be caused by
  [getLanguage](#getlanguage) failing, or by attempting to switch when
  [getLanguage](#getlanguage) is not provided and no language object is cached.

#### loadingComponent

- Provide a component to be rendered while a language object is loading. This
  will be rendered when the initial language object is loading, as well as any
  time the language is switched. If you are switching to a cached language, or
  when provided a language object, this will not be rendered as the switch will
  be immediate.

### Example Initialization

```ts
ReactDom.render(
  <LocalizeProvider
    loadingComponent={<div>{'Loading...'}</div>}
    getLanguage={getLanguageAPI}
    initLanguage="en"
  >
    <App />
  </LocalizeProvider>,
  document.getElementById('root'),
);
```

## LocalizeContext

All methods for localization and updating the Provider are accessed through this
Context.

### LocalizeContext API

```ts
interface ILocalizeContextValue {
  setLanguage?: (
    language: string,
    languageObject?: ILanguageObject,
    shouldCache?: boolean,
  ) => Promise<void>;

  isLanguageCached?: (language: string) => boolean;

  clearCache?: (language?: string) => void;

  currentLanguage?: string;

  isLoaded?: boolean;

  t?(phrase: string): string;
  t?(phrase: string, smartCount: number): string;
  t?(
    phrase: string,
    interpolationOptions: Polyglot.InterpolationOptions,
  ): string;
}
```

#### setLanguage

- Call this method to set the language. You must provide a language string (ex:
  'en'), and can optionally provide the corresponding language object.
  Additionally, you can specify whether or not to cache the language object for
  future use. If the language is not cached and no language object is provided,
  [getLanguage](#getlanguage) will be called to get the language object for the
  provided language.

#### isLanguageCached

- Check if there is a cached language object for a given language string. This
  can be called before [setLanguage](#setlanguage) in order to check whether you
  will have to provide a language object.

#### clearCache

- Clears a provided language from the cache if it exists. If no language is
  provided, this method clears all languages from the cache.

#### currentLanguage

- Returns the current language string.

#### isLoaded

- Returns true if language is loaded, false if it is currently fetching a
  language object from the [getLanguage](#getlanguage) API method.

#### t

- This is the Polyglot `t` method. For information on how to use this, check the
  [documentation](http://airbnb.io/polyglot.js/);

### Example Use

> Note: See the [Localize Component](#localize) documentation for more
> information on the use below

#### Functional Component

```js
import React, { useContext, useEffect } from 'react';
import { LocalizeContext, Localize } from 'react-localize';

function MyComponent({}) {
  const localize = useContext(LocalizeContext);

  useEffect(() => {
    localize.setLanguage('en');
  }, []);

  return (
    <>
      {/* Can do either one! */}
      {localize.t('translate_token')}
      {/* See Localize Component for information on below. */}
      <Localize t={'translate_token'} />
    </>
  );
}
```

#### Class Component

```js
import React, { Component } from 'react';
import { LocalizeContext, Localize } from 'react-localize';

class MyComponent extends Component {
  static contextType = LocalizeContext;

  componentDidMount() {
    const localize = this.context;
    localize.setLanguage('en');
  }

  render() {
    const localize = this.context;

    return (
      <>
        {/* Can do either one! */}
        {localize.t('translate_token')}
        {/* See Localize Component for information on below. */}
        <Localize t={'translate_token'} />
      </>
    );
  }
}
```

## Localize

### Localize Props

```ts
interface ILocalizeProps {
  t: string;
  options?: number | Polyglot.InterpolationOptions;
  isUpper?: boolean;
  isLower?: boolean;
}
```

#### t

- The language phrase you wish to translate.

#### options

- Any options for the translated phrase. This acts the same as a second argument
  given to Polyglot. For information on how to use this, check the
  [documentation](http://airbnb.io/polyglot.js/);

#### isUpper

- Transform entire returned phrase to uppercase.

#### isLower

- Transform entire returned phrase to lowercase.

### Example Component

```js
// Returns "Hi John" if language is "en" or "Bonjour John" if language is "fr".
<Localize t="hi_name" options={{ name: 'John' }} />
```

## staticTranslate

You can call static translate in order to translate a phrase outside of React.
For example, you can use it for translating something within Redux to be stored
in the state. However is one important thing to consider: **This will be a
static translation. It will not update when you update the language using the
Localize context.**

Static translate only exposes the method `t`, which exacly matches the `t`
method within Polyglot. For information on how to use this, check the
[documentation](http://airbnb.io/polyglot.js/). This method can be used as
follows:

```js
// Returns "Hi John" if language is "en" or "Bonjour John" if language is "fr".
const translatedPhrase = staticTranslate.t('hi_name', { name: 'John' });
```
