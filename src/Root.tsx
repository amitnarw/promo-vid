import { Composition } from "remotion";
import { FILM_FRAMES, Film } from "./film/Film";
import { ReplayTest } from "./compositions/ReplayTest";
import { StyleHook } from "./compositions/StyleHook";
import { TakeFrame } from "./compositions/TakeFrame";

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ReplayTest" component={ReplayTest} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="StyleHook" component={StyleHook} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="TakeFrame" component={TakeFrame} durationInFrames={1} fps={30} width={960} height={1280}
      defaultProps={{ take: "spike-wiki-06", tab: "page-96CBCD9F", t: 40, start: 1793255338710, w: 960, h: 1280 }} />
  </>
);
