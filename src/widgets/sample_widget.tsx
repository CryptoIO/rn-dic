import { usePlugin, renderWidget, useTracker } from '@remnote/plugin-sdk';

export const SampleWidget = () => {
  const plugin = usePlugin();

  let name = useTracker(() => plugin.settings.getSetting('name')) as string;
  let likesPizza = useTracker(() => plugin.settings.getSetting('pizza')) as string;
  let favoriteNumber = useTracker(() => plugin.settings.getSetting('favorite-number')) as number;

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light-positive rn-clr-content-positive">
      <h1 className="text-xl">Sample Plugin</h1>
      <div>
        Hi {name}, you {!!likesPizza ? 'do' : "don't"} like pizza and your favorite number is{' '}
        {favoriteNumber}!
      </div>
    </div>
  );
};

renderWidget(SampleWidget);
