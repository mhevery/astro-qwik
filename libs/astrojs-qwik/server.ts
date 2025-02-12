import { jsx } from "@builder.io/qwik";
import { renderToString } from "@builder.io/qwik/server";
import type { RendererContext } from "./types";
import { manifest } from "@qwik-client-manifest";
import type { SymbolMapper, SymbolMapperFn } from "@builder.io/qwik/optimizer";

async function check(
  this: RendererContext,
  Component: any,
  props: Record<string, any>,
  slotted: any
) {
  try {
    if (typeof Component !== "function") return false;
    const { html } = await renderToStaticMarkup.call(
      this,
      Component,
      props,
      slotted
    );
    console.log("End of check");
    return typeof html === "string";
  } catch (error) {
    console.error("Error in check:", error);
  }
}

export async function renderToStaticMarkup(
  this: RendererContext,
  Component: any,
  props: Record<string, any>,
  slotted: any
) {
  try {
    const slots = {};

    for (const [key, value] of Object.entries(slotted)) {
      slots[key] = value;
    }

    const app = jsx(Component, { props, slots });

    const symbolMapper: SymbolMapperFn = (
      symbolName: string,
      mapper: SymbolMapper | undefined
    ) => {
      console.log("SymbolMapperFn", symbolName, mapper);
      return [symbolName, "/src/" + symbolName.toLocaleLowerCase() + ".js"];
    };

    // TODO: `jsx` must correctly be imported.
    // Currently the vite loads `core.mjs` and `core.prod.mjs` at the same time and this causes issues.
    // WORKAROUND: ensure that `npm postinstall` is run to patch the `@builder.io/qwik/package.json` file.
    const result = await renderToString(app, {
      containerTagName: "div",
      manifest: manifest,
      symbolMapper: manifest ? undefined : symbolMapper,
      qwikLoader: { include: "always" },
    });

    console.log("end of renderToStaticMarkup");
    return result;
  } catch (error) {
    console.error("Error in renderToStaticMarkup:", error);
    throw error;
  }
}

export default {
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
  check,
};
