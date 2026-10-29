import { Config } from "@remotion/cli/config";

// ANGLE gives the 3D mascot real WebGL on this Intel GPU
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
