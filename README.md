# Localize Toolkit [![Build Status](https://travis-ci.org/hetznerZA/localize-toolkit.svg?branch=master)](https://travis-ci.org/hetznerZA/localize-toolkit) [![NPM Version](https://badge.fury.io/js/localize-toolkit.svg)](https://www.npmjs.com/package/localize-toolkit)

A localization library that uses React's context API and the Polyglot
localization library to provide robust localization tools for React projects.

**Features**:

1. Updates every translated phrase on language switch without remounting any
   components
1. Caching phrases to avoid repeat fetching
1. Static localization method for non-React files

**Examples**:

1. [Minimal Example](https://codesandbox.io/s/yprnw94rwj)
   - The absolute bare-bones example of using Localize Toolkit
1. ["Kitchen Sink" Full Example](https://codesandbox.io/s/v63mqkm95y)
   - A full example with faked API calls to fetch new languages
1. [Overlay Pattern Example](https://codesandbox.io/s/0n6xy6800)
   - A pattern to avoid remounting entirely, with an overlay for loading

**Dependencies**:

1.  This package has a peer dependency on version `>16.8.0` of `react` and
    `react-dom`, as it uses the
    [Hooks API](https://reactjs.org/docs/hooks-intro.html).

    > If you are not using Hooks, you can instead
    > [install `v0.4.2` of localize toolkit](https://www.npmjs.com/package/localize-toolkit/v/0.4.2)
    > which supports `^16.6.0` of `react` and `react-dom`. `v0.4.2`. This can be
    > done as follows:
    >
    > ```sh
    > # yarn
    > yarn add localize-toolkit@0.4.2
    >
    > # npm
    > npm i localize-toolkit@0.4.2
    > ```

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
     - [getPhrases](#getphrases)
     - [noCache](#nocache)
   - [Example Initialization](#example-initialization)
2. [LocalizeContext](#localizecontext)
   - [LocalizeContext API](#localizecontext-api)
     - [loading](#loading)
     - [error](#error)
     - [currentLanguage](#currentlanguage)
     - [isLanguageCached](#islanguagecached)
     - [setLanguage](#setlanguage)
     - [clearCache](#clearcache)
     - [t](#t)
   - [Example Use](#example-use)
     - [Functional Component](#functional-component)
     - [Class Component](#class-component)
3. [Localize](#localize)
   - [Localize Props](#localize-props)
     - [t](#t-1)
     - [options](#options)
     - [transformString](#transformString)
   - [Example Component](#example-component)
4. [staticTranslate](#statictranslate)

</details>

<br />
<br />

## LocalizeProvider

Localize provider contains the core functionality, and provides localize methods
to both the [LocalizeContext](#localizecontext) and the [Localize](#localize)
component.

### LocalizeProvider Props

```tsx
interface LocalizeProviderProps {
  getPhrases?: (language: string) => Promise<Phrases>;
  noCache?: boolean;
}
```

#### `getPhrases`

- Provide this prop to give an API endpoint that can be called with language.
  This should asynchronously return a `Phrases` object.

#### `noCache`

- By default, this is false. If set to true, none of the given or fetched
  phrases will be cached within the provider. Any subsequent attempts to switch
  to these languages will require a new phrases object be provided, or will make
  a call to `getPhrases`.

### Example Initialization

```tsx
ReactDom.render(
  <LocalizeProvider getPhrases={getLanguageAPI} noCache>
    <App />
  </LocalizeProvider>,
  document.getElementById('root'),
);
```

<br />
<br />

## LocalizeContext

All methods for localization and updating the
[LocalizeProvider](#localizeprovider) are accessed through this Context.

### LocalizeContext API

<!-- prettier-ignore -->
```tsx
interface LocalizeContextValue {
  loading: boolean;
  error: Error | null;
  currentLanguage: string;
  isLanguageCached(language: string): boolean;
  setLanguage(language: string, phrases?: Phrases): Promise<void>;
  clearCache(language?: string): void;
  t: (phrase: string, options?: number | Polyglot.InterpolationOptions) => string;
}
```

#### `loading`

- Returns true if language is being fetched.

#### `error`

- Returns any errors encountered in setting the language.

#### `currentLanguage`

- Returns the current language string.

#### `isLanguageCached`

- Check if there are cached phrases for a given language string. This can be
  called before `setLanguage` in order to check whether you will have to provide
  a phrases object.

#### `setLanguage`

- Call this method to set the language. You must provide a language string (ex:
  `'en'`), and can optionally provide the corresponding language object. Once
  this method is called, there is a sequence of checks:

  - If the phrases are provided, they will be used for the given language.

  - If no phrases are provided:

    - If the phrases aren't cached, fetch them from `getPhrases` prop in
      [LocalizeProvider](#localizeprovider).

      > Note: If no phrases are cached and no `getPhrases` prop is provided, an
      > error will occur as the localize toolkit has no way to set the phrases
      > for the specified language.

    - If they are cached, use the cached phrases.

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

```tsx
import React, {useContext, useEffect} from 'react';
import {LocalizeContext, Localize} from 'react-localize';

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
      {translateOutsideOfJSX()}
      <Localize t={'translate_token'} />
    </>
  );
}
```

#### Class Component

```tsx
import React, {Component} from 'react';
import {LocalizeContext, Localize} from 'react-localize';

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
        {this.translateOutsideOfJSX()}
        <Localize t={'translate_token'} />
      </>
    );
  }
}
```

<br />
<br />

## Localize

### Localize Props

```tsx
interface LocalizeProps {
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

- A function that takes in the translated string and returns the string that
  will be rendered by the component. For example, you can convert the translated
  string to uppercase.

### Example Component

```tsx
// Returns "HI JOHN" if language is "en" or "BONJOUR JOHN" if language is "fr".
<Localize
  t="hi_name"
  options={{name: 'John'}}
  transformString={translated => translated.toUpperCase()}
/>
```

<br />
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

```tsx
// Returns "Hi John" if language is "en" or "Bonjour John" if language is "fr".
const translatedPhrase = staticTranslate.t('hi_name', {name: 'John'});
```
