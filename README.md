# Localize Toolkit [![Build Status](https://travis-ci.org/hetznerZA/localize-toolkit.svg?branch=master)](https://travis-ci.org/hetznerZA/localize-toolkit) [![NPM Version](https://badge.fury.io/js/localize-toolkit.svg)](https://www.npmjs.com/package/localize-toolkit)

A localization library that uses React's context API and the Polyglot
localization library to provide robust localization tools for React projects.

**Features**:

1. Updates every translated phrase on language switch without remounting any
   components
1. Caching phrases to avoid repeat fetching
1. Static localization method for non-React files
1. Loading placeholder prop while phrases are being fetched

**Dependencies**:

1.  This package has a peer dependency on version `^16.7.0-alpha.2` of `react`
    and `react-dom`, as it uses the
    [Hooks API](https://reactjs.org/docs/hooks-intro.html). **This is currently
    in pre-release, so localize-toolkit should _not_ be used in production
    code.** If your code is not using the pre-release `v16.7` of `react` and
    `react-dom`, you can install it using the following commands:

    ```sh
    # yarn
    yarn add react@next react-dom@next

    # npm
    npm i react@next react-dom@next
    ```

1.  This package has a dependency on `node-polyglot`. You may have some type
    issues if you are using TypeScript, since some of the types are from
    `node-polyglot`. If this is an issue, you can install the
    `@types/node-polyglot` as a dev-dependency:

    ```sh
    # yarn
    yarn add @types/node-polyglot -D

    # npm
    npm i @types/node-polyglot -D
    ```

The toolkit exposes 4 items: [LocalizeProvider](#localizeprovider),
[LocalizeContext](#localizecontext), [Localize](#localize) and
[staticTranslate](#statictranslate). Expand the table of contents to jump to a
specific item within these.

<details><summary><b>Table of Contents</b></summary>

1. [LocalizeProvider](#localizeprovider)
   - [LocalizeProvider Props](#localizeprovider-props)
     - [initialLanguage](#initiallanguage)
     - [initialPhrases](#initialphrases)
     - [getPhrases](#getphrases)
     - [onFailed](#onfailed)
     - [loadingComponent](#loadingcomponent)
     - [noCache](#nocache)
   - [Example Initialization](#example-initialization)
2. [LocalizeContext](#localizecontext)
   - [LocalizeContext API](#localizecontext-api)
     - [currentLanguage](#currentlanguage)
     - [isLoaded](#isloaded)
     - [setLanguage](#setlanguage)
     - [isLanguageCached](#islanguagecached)
     - [clearCache](#clearcache)
     - [t](#t)
   - [Example Use](#example-use)
     - [Functional Component](#functional-component)
     - [Class Component](#class-component)
3. [Localize](#localize)
   - [Localize Props](#localize-props)
     - [t](#t-1)
     - [options](#options)
     - [isUpper](#isupper)
     - [isLower](#islower)
   - [Example Component](#example-component)
4. [staticTranslate](#statictranslate)

</details>

---

<br />

## LocalizeProvider

Localize provider contains the core functionality, and provides localize methods
to both the [LocalizeContext](#localizecontext) and the [Localize](#localize)
component.

### LocalizeProvider Props

```ts
interface ILocalizeProviderProps {
  initialLanguage?: string;
  initialPhrases?: IPhrases;
  getPhrases?: (language: string) => Promise<IPhrases>;
  onFailed?: (error: Error) => any;
  loadingComponent?: React.ReactNode;
}
```

#### `initialLanguage`

- Provide the initial language string. If used with `initialPhrases`, will set
  language and use the object provided to map phrases. Otherwise, will call
  `getPhrases API endpoint if provided.

#### `initialPhrases`

- If `initialLanguage` is provided, this prop can be given to provide a phrases
  object. Otherwise an API call to `getPhrases` will be made with the initial
  language.

#### `getPhrases`

- Provide this prop to give an API endpoint that can be called with language.
  This should asynchronously return a phrases object.

#### `onFailed`

- Callback for when switching a language fails. This could be caused by
  `getPhrases` failing, or by attempting to switch when `getPhrases` is not
  provided and no phrases are cached.

#### `loadingComponent`

- Provide a component to be rendered while a language object is loading. This
  will be rendered any time phrases have to be fetched. If the phrases are
  cached, or when provided a phrases object, this will not be rendered as the
  switch will be immediate.

#### `noCache`

- By default, this is false. If set to true, none of the given or fetched
  phrases will be cached within the provider. Any subsequent attempts to switch
  to these languages will require a new phrases object be provided, or will make
  a call to `getPhrases`.

### Example Initialization

```ts
ReactDom.render(
  <LocalizeProvider
    loadingComponent={<div>{'Loading...'}</div>}
    getPhrases={getLanguageAPI}
    initialLanguage="en"
    cachePhrases
  >
    <App />
  </LocalizeProvider>,
  document.getElementById('root'),
);
```

---

<br />

## LocalizeContext

All methods for localization and updating the
[LocalizeProvider](#localizeprovider) are accessed through this Context.

### LocalizeContext API

<!-- prettier-ignore -->
```ts
interface ILocalizeContextValue { 
  currentLanguage: string;
  isLoaded: boolean;
  setLanguage(language: string, phrases?: IPhrases): Promise<void>;
  isLanguageCached(language: string): boolean;
  clearCache(language?: string): void;
  t: (phrase: string, options?: number | Polyglot.InterpolationOptions) => string;
}
```

#### `currentLanguage`

- Returns the current language string.

#### `isLoaded`

- Returns true if language is loaded, false if the
  [LocalizeProvider](#localizeprovider) is currently fetching a phrases object.

#### `setLanguage`

- Call this method to set the language. You must provide a language string (ex:
  `'en'`), and can optionally provide the corresponding language object. Once
  this method is called, there is a sequence of checks:

  - If the phrases are provided, they will be used for the given language.
  - If no phrases are provided:

    - If the phrases aren't cached, fetch them from `getPhrases` prop in
      [LocalizeProvider](#localizeprovider).

      > Note: If no phrases are cached and no `getPhrases` prop is provided, the
      > `onFailed` prop will be called as the localize toolkit has no way to set
      > the phrases for the specified language.

    - If they are cached, use the cached phrases.

#### `isLanguageCached`

- Check if there are cached phrases for a given language string. This can be
  called before `setLanguage` in order to check whether you will have to provide
  a phrases object.

#### `clearCache`

- Clears a phrases object for the provided language from the cache if it exists.
  If no language is provided, this method clears all phrases from the cache.

#### `t`

- This is the Polyglot `t` method. For information on how to use this, check the
  [documentation](http://airbnb.io/polyglot.js/);

### Example Use

> Note: See the [Localize](#localize) Component documentation for more
> information on using the JSX component below.

#### Functional Component

```ts
import React, { useContext, useEffect } from 'react';
import { LocalizeContext, Localize } from 'react-localize';

function MyComponent({}) {
  const localize = useContext(LocalizeContext);

  useEffect(() => {
    localize.setLanguage('en');
  }, []);

  const translateOutsideOfJSX = () => {
    return localize.t('translate_token');
  };

  return (
    <>
      {/* See Localize Component for information on this component. */}
      <Localize t={'translate_token'} />
    </>
  );
}
```

#### Class Component

```ts
import React, { Component } from 'react';
import { LocalizeContext, Localize } from 'react-localize';

class MyComponent extends Component {
  static contextType = LocalizeContext;

  componentDidMount() {
    const localize = this.context;
    localize.setLanguage('en');
  }

  translateOutsideOfJSX() {
    const localize = this.context;
    return localize.t('translate_token');
  }

  render() {
    const localize = this.context;

    return (
      <>
        {/* See Localize Component for information on below. */}
        <Localize t={'translate_token'} />
      </>
    );
  }
}
```

---

<br />

## Localize

### Localize Props

```ts
interface ILocalizeProps {
  t: string;
  options?: number | Polyglot.InterpolationOptions;
  transformString?: (translated: string) => string;
}
```

#### `t`

- The phrase string you wish to translate.

#### `options`

- Any options for the translated phrase. This acts the same as a second argument
  given to Polyglot. For information on how to use this, check the
  [documentation](http://airbnb.io/polyglot.js/);

#### `transformString`

- A function that takes in the translated string and returns the string that is
  rendered by the component. For example, you can convert the translated string
  to uppercase.

### Example Component

```ts
// Returns "HI JOHN" if language is "en" or "BONJOUR JOHN" if language is "fr".
<Localize
  t="hi_name"
  options={{ name: 'John' }}
  transformString={translated => translated.toUpperCase()}
/>
```

---

<br />

## staticTranslate

> Note: This should **only** be used in cases where you are unable to use the
> context components. This would most likely be outside of React, such as inside
> of a Redux reducer. If you are using this inside a React file, you can
> probably use [LocalizeContext](#localizecontext) or [Localize](#localize)
> instead.

You can call static translate in order to translate a phrase outside of React.
For example, you can use it for translating something within Redux to be stored
in the state. However is one important thing to consider: **This will be a
static translation. It will not update when you update the language using the
Localize context.**

Static translate only exposes the method `t`, which exacly matches the `t`
method within Polyglot. For information on how to use this, check the
[documentation](http://airbnb.io/polyglot.js/). This method can be used as
follows:

```ts
// Returns "Hi John" if language is "en" or "Bonjour John" if language is "fr".
const translatedPhrase = staticTranslate.t('hi_name', { name: 'John' });
```
