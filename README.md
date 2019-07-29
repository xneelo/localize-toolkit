# Localize Toolkit [![Build Status](https://travis-ci.org/xneelo/localize-toolkit.svg?branch=master)](https://travis-ci.org/xneelo/localize-toolkit) [![NPM Version](https://badge.fury.io/js/localize-toolkit.svg)](https://www.npmjs.com/package/localize-toolkit)

A localization library that uses React's context API and the Polyglot
localization library to provide robust localization tools for React projects.

**Features**:

1. Updates every translated phrase on language switch without remounting any
   components
1. Caching phrases to avoid repeat fetching
1. Static localization method for non-React files

**Examples**:

1. [Minimal Example](https://codesandbox.io/s/20-localize-toolkit-minimal-u3333)
   - The absolute bare-bones example of using Localize Toolkit
1. ["Kitchen Sink" Full Example](https://codesandbox.io/s/v63mqkm95y)
   - A full example with faked API calls to fetch new languages
1. [Overlay Pattern Example](https://codesandbox.io/s/0n6xy6800)
   - A pattern to avoid remounting entirely, with an overlay for loading
1. [Pseudo Localization](https://codesandbox.io/s/20-localize-toolkit-pseudo-localization-lpp1q)
   - An example using pseudo localization (useful for testing)

The toolkit exposes 5 items: [LocalizeProvider](#localizeprovider),
[LocalizeContext](#localizecontext), [Localize](#localize),
[useLocalize](#uselocalize) and [staticTranslate](#statictranslate). Expand the
table of contents to jump to a specific item within these.

<details><summary><b>Table of Contents</b></summary>

1. [LocalizeProvider](#localizeprovider)
   - [LocalizeProvider Props](#localizeprovider-props)
     - [getPhrases](#getphrases-language-string--promisephrases)
     - [noCache](#nocache-boolean)
     - [noCache](#pseudolocalize-boolean)
   - [Example Initialization](#example-initialization)
2. [LocalizeContext](#localizecontext)
   - [LocalizeContext API](#localizecontext-api)
     - [loading](#loading-boolean)
     - [error](#error-error--null)
     - [currentLanguage](#currentlanguage-string)
     - [isLanguageCached](#islanguagecached-language-string--boolean)
     - [setLanguage](#setlanguage-language-string-phrases-phrases--promisevoid)
     - [clearCache](#clearcache-language-string--void)
     - [t](#t-phrase-string-options-number--polyglotinterpolationoptions--string)
   - [Example Use](#example-use)
     - [How to consume context](#how-to-consume-context)
     - [Example in Functional Component](#example-in-functional-component)
     - [Example in Class Component](#example-in-class-component)
3. [Localize](#localize)
   - [Localize Props](#localize-props)
     - [t](#t-string)
     - [options](#options-number--polyglotinterpolationoptions)
     - [transformString](#transformstring-translated-string--string)
   - [Example Component](#example-component)
4. [useLocalize](#uselocalize)
5. [staticTranslate](#statictranslate)

</details>

<details><summary><b>Expand for dependency details</b></summary>

1.  This package has a peer dependency on version `>16.8.0` of `react` and
    `react-dom`, as it uses the
    [Hooks API](https://reactjs.org/docs/hooks-intro.html).

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

</details>

<br />
<br />

## LocalizeProvider

Localize provider contains the core functionality, and provides localize methods
to both the [LocalizeContext](#localizecontext) and the [Localize](#localize)
component.

### LocalizeProvider Props

#### `getPhrases`: _`(language: string) => Promise<Phrases>`_

- Provide this prop to give an API endpoint that can be called with language.
  This should asynchronously return a `Phrases` object.

#### `noCache`: _`boolean`_

- By default, this is false. If set to true, none of the given or fetched
  phrases will be cached within the provider. Any subsequent attempts to switch
  to these languages will require a new phrases object be provided, or will make
  a call to `getPhrases`.

#### `pseudolocalize`: _`boolean`_

- By default, this is false. If set to true, will apply pseudo localization to
  all returned strings. This is for testing if your application can adapt to
  longer strings from other languages. **Do not enable this in production.**

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

#### `loading`: _`boolean`_

- Returns true if language is being fetched.

#### `error`: _`Error | null`_

- Returns any errors encountered in setting the language.

#### `currentLanguage`: _`string`_

- Returns the current language string.

#### `isLanguageCached`: _`(language: string) => boolean`_

- Check if there are cached phrases for a given language string. This can be
  called before `setLanguage` in order to check whether you will have to provide
  a phrases object.

#### `setLanguage`: _`(language: string, phrases?: Phrases) => Promise<void>`_

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

#### `clearCache`: _`(language?: string) => void`_

- Clears a phrases object for the provided language from the cache if it exists.
  If no language is provided, this method clears all phrases from the cache.

#### `t`: _`(phrase: string, options?: number | Polyglot.InterpolationOptions) => string;`_

- This is the Polyglot `t` method. For information on how to use this, check the
  [documentation](http://airbnb.io/polyglot.js/);

### Example Use

Here are some examples for using the localize context within your components.

#### How to consume context

There are three ways to use the localize context:

1. The exported [useLocalize](#uselocalize) hook (a nice wrapper for the
   `useContext` hook so you don't need two imports):

   ```tsx
   const localize = useLocalize();
   localize.t('some_word');
   ```

1. The `useContext` hook (we recommend you use [useLocalize](#uselocalize)
   instead though):

   ```tsx
   const localize = useContext(LocalizeContext);
   localize.t('some_word');
   ```

1. The exported [Localize](#localize) component (more info below):

#### Example in Functional Component

```tsx
import React, {useContext, useEffect} from 'react';
import {Localize, useLocalize} from 'localize-toolkit';

function MyComponent({}) {
  const {setLanguage, t} = useLocalize();

  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);

  return (
    <>
      {/* To translate using the context: */}
      {t('translate_token')}

      {/* To translate as a JSX element: */}
      <Localize t={'translate_token'} />
    </>
  );
}
```

#### Example in Class Component

```tsx
import React, {Component} from 'react';
import {LocalizeContext, Localize} from 'localize-toolkit';

class MyComponent extends Component {
  static contextType = LocalizeContext;

  componentDidMount() {
    const {setLanguage} = this.context;
    setLanguage('en');
  }

  render() {
    const {t} = this.context;

    return (
      <>
        {/* To translate using the context: */}
        {t('translate_token')}

        {/* To translate as a JSX element: */}
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

#### `t`: _`string`_

- The phrase string you wish to translate.

#### `options`: _`number | Polyglot.InterpolationOptions`_

- Any options for the translated phrase. This acts the same as a second argument
  given to Polyglot. For information on how to use this, check the
  [documentation](http://airbnb.io/polyglot.js/);

#### `transformString`: _`(translated: string) => string`_

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

## useLocalize

This is simply a hook to wrap `useContext`. As such, these are equivalent:

**useLocalize** example:

```tsx
import React from 'react';
import {useLocalize} from 'localize';

function Component() {
  const localize = useLocalize();
}
```

**useContext** example:

```tsx
import React, {useContext} from 'react';
import {LocalizeContext} from 'localize';

function Component() {
  const localize = useContext(LocalizeContext);
}
```

As you can see, it just simplifies it slightly by allowing one less import and
less code written.

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
