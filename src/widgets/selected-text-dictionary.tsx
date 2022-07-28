import { renderWidget, usePlugin, useRunAsync, useTracker } from '@remnote/plugin-sdk';
import React from 'react';

import { PreviewDefinitions } from '../components/preview-definitions';
import { WordData } from '../models/model';

function cleanSelectedText(s?: string) {
  return (
    s
      // Remove leading and trailing whitespace
      ?.trim()
      // Split on whitespace and take the first word
      ?.split(/(\s+)/)[0]
      // This removes non-alphabetic characters
      // including Chinese characters, Cyrillic etc.
      // But the Dictionary API in this plugin only
      // works with English, so this is okay.
      ?.replaceAll(/[^a-zA-Z]/g, '')
  );
}

// We use the `useDebounce` hook to limit the number of API calls
// made to the dictionary API to avoid getting rate limited by the API
export function useDebounce<T>(value: T, msDelay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, msDelay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, msDelay]);
  return debouncedValue;
}

function SelectedTextDictionary() {
  const plugin = usePlugin();

  // This stores the response from the dictionary API.
  const [wordData, setWordData] = React.useState<WordData>();

  // By wrapping the call to `useTracker` in
  // `useDebounce`, the `selTextRichText` value will only get set
  // *after* the user has stopped changing the selected text for 0.5 seconds.
  // Since the API gets called every time the value of `selTextRichText` /
  // `selText` change, debouncing limits unnecessary API calls.
  const selTextRichText = useDebounce(
    useTracker(async (reactivePlugin) => await reactivePlugin.editor.getSelectedRichText()),
    500 // 0.5 seconds
  );

  const searchTerm = cleanSelectedText(
    // `useRunAsync` hook allows us to call the async
    // plugin.richText.toString function inline, rather
    // than needing to wrap things in useEffect and setState.
    useRunAsync(async () => await plugin.richText.toString(selTextRichText || []), [selTextRichText])
  );

  // When the selText value changes, and it is not null or undefined,
  // call the dictionary API to get the definition of the selText.
  React.useEffect(() => {
    const getAndSetData = async () => {
      if (!searchTerm) {
        return;
      }
      try {
        const url = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
        const response = await fetch(url + searchTerm);
        const json = await response.json();
        setWordData(Array.isArray(json) ? json[0] : undefined);
      } catch (e) {
        console.log('Error getting dictionary info: ', e);
      }
    };

    getAndSetData();
  }, [searchTerm]);

  return (
    <div className="min-h-[200px] max-h-[500px] overflow-y-scroll m-4">
      {wordData && <PreviewDefinitions wordData={wordData} onSelectDefinition={() => {}} />}
    </div>
  );
}

renderWidget(SelectedTextDictionary);
