import {renderWidget, RNPlugin, usePlugin, useRunAsync, useTracker} from '@remnote/plugin-sdk'
import React from 'react';

function cleanSelectedText(text?: string) {
    return text?.trim()?.split(/(\s+)/)[0]?.replaceAll(/[^a-zA-Z]/g, '')
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

    const[wordData, setWordData] = React.useState();

    const selTextRichText = useDebounce(
        useTracker( async (reactivePlugin:RNPlugin) => {
        await reactivePlugin.editor.getSelectedRichText();
    }), 500);

    const searchTerm = cleanSelectedText(
        // `useRunAsync` hook allows us to call the async
        // plugin.richText.toString function inline, rather
        // than needing to wrap things in useEffect and setState.
        useRunAsync(
            async () => await plugin.richText.toString(selTextRichText || []),
            [selTextRichText],
        ),
    )

    React.useEffect( () => {
        const getAndSetData = async() => {
            if(!searchTerm) {
                return;
            }

            try {
                const url = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
                const response = await fetch(url + searchTerm);
                const json = await response.json();
                setWordData(Array.isArray(json) ? json[0] : undefined);
            } catch(err) {
                console.log('Error getting dictionary info: ', err)
            }
        }

        getAndSetData();
    }, [searchTerm])
    return (
        <pre>{JSON.stringify(wordData, null, 2)}</pre>
    )
}

renderWidget(SelectedTextDictionary)