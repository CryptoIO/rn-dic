import '../style.css';
import '../App.css';

import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('selected-text-dictionary', WidgetLocation.SelectedTextMenu, {
    dimensions: {
      height: 'auto',
      width: '100%',
    },
    widgetTabIcon: 'https://cdn-icons-png.flaticon.com/512/2069/2069571.png',
    widgetTabTitle: 'Dictionary',
  });

  await plugin.settings.registerStringSetting({
    id: 'dictionary root',
    title: 'Dictionary Root Rem',
    description: 'The Rem to add words to.',
  });
}

async function onDeactivate(plugin: ReactRNPlugin) {
  return;
}

declareIndexPlugin(onActivate, onDeactivate);
