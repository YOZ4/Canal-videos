import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// "angle" é o recomendado para @remotion/three. Em máquinas sem GPU
// (servidores/CI) use: npx remotion render ... --gl=swangle
Config.setChromiumOpenGlRenderer("angle");
