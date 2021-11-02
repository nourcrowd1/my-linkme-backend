import marked from "marked";
import querystring from "querystring";
import matter from "gray-matter";
import Page from "../../entities/Page";
import { fileRenderer } from "../renderer";

const renderer = {
  image(href: string, caption: string, text: string) {
    const [url, query] = href.split("?");
    const params = query ? querystring.parse(query.replace("__", " ")) : {};
    delete params["alt"];
    delete params["src"];
    const image = `<amp-img
        alt="${text}"
        ${params2props(params)}
        src="${url}"
      ></amp-img>`;
    if (!caption) return image;
    return `<figure>
        ${image}
        <figcaption>${caption}</figcaption>
      </figure>`;
  },
} as any;

function params2props(params: Record<string, string | string[]>) {
  return Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (Array.isArray(value)) return `${key}="${value.join(",")}"`;
      return `${key}="${params[key]}"`;
    })
    .join(" ");
}

marked.use({ renderer });

export default async function sitePage(pathname: string, options: {currentUser: {} | null}) {
  const page = await Page.findOne({
    path: pathname,
  });
  if (!page?.id) return;
  const { data, content: pageContent } = matter(page.content.trim());
  const html = marked(pageContent);
  return {html:pageContent};
}
