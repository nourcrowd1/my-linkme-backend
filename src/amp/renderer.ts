import AmpOptimizer from "@ampproject/toolbox-optimizer";
import { Liquid } from "liquidjs";
import { dbEngine, fileEngine } from "./engine";
import { analyticsURL } from "../config";
const ampOptimizer = AmpOptimizer.create();

export function optimize(html: string) {
  return ampOptimizer.transformHtml(html);
}

const defaultParams = {
  analyticsURL,
};

export function renderer(engine: Liquid) {
  return {
    renderText: (html: string, params: any = {}) =>
      engine
        .parseAndRender(html, { ...defaultParams, ...params })
        .then(optimize),
    renderFile: (filename: string, params: any = {}) =>
      engine
        .renderFile(filename, { ...defaultParams, ...params })
        .then(optimize),
  };
}

export const fileRenderer = renderer(fileEngine);
export const dbRenderer = renderer(dbEngine);
