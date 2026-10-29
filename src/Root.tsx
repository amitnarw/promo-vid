import { Composition } from "remotion";
import { ReplayTest } from "./compositions/ReplayTest";
import { StyleHook } from "./compositions/StyleHook";

export const Root: React.FC = () => (
  <>
    <Composition id="ReplayTest" component={ReplayTest} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="StyleHook" component={StyleHook} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
