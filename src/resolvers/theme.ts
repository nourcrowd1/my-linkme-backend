import { ILike } from "typeorm";
import { fileRenderer } from "../amp/renderer";
import Theme from "../entities/Theme";
import { filter } from "lodash";
import { HTTPError } from "../errors";
import User from "../entities/User";
import {buildLinkWithSublinks} from "../lib";

export default {
  Mutation: {
    createTheme: (_, { input }) => {
      const theme = new Theme();
      Object.assign(theme, input);
      return theme.save();
    },
    updateTheme: async (_, { id, input }) => {
      try {
        await Theme.update(id, input);
        return Theme.findOne(id);
      }
      catch (err) {
        throw new HTTPError(500, err.message);
      }
    },
    deleteTheme: (_, { id }) => {
      return Theme.delete(id);
    },
  },
  Query: {
    theme: (_, { id }) => Theme.findOne(id),
    themeForAdmin: (_, { id }) => Theme.findOne(id),
    themes: async (
      _,
      { input }: { input: { limit?: number; offset?: number; search?: {field:string, value:string}; order?: {field:string, direction:string} } }
    ) => {
      const { limit, offset, search, order } = input ?? {};
      const take = limit ?? 10;
      const skip = offset ?? 0;

      const items = await Theme.findAndCount({
        skip,
        take,
        order: order ? {[order.field]:order.direction} : {id:"DESC"},
        where: search ? {[search.field]: ILike(`%${search.value}%`)} : null
      });

      return { items:items[0], nextOffset: items[0].length === take ? skip + take : null, total:items[1] };
    },
    previewTheme: async (_, { template, params }) => {
      return fileRenderer.renderText(template, params);
    },
    preview: async (_, { id, params }, { user }) => {
      const input = id ? (await Theme.findOne(id))?.template : undefined;
      if (!user.enable_partner_links) params.links = filter(params.links, link => {
        return link.type !== 'crowd1'
      });

      params.links = buildLinkWithSublinks(params.links);

      if (!input)
        return fileRenderer.renderFile("themes/default", params ?? user);
      return fileRenderer.renderText(input, params ?? user);
    },
  },
};
