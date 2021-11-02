import { Like } from "typeorm";
import Style from "../entities/Style";

export default {
  Mutation: {
    createStyle: (_, { input }) => {
      return Style.create(input);
    },
    updateStyle: (_, { id, input }) => {
      return Style.update(id, input);
    },
    deleteStyle: (_, { id }) => {
      return Style.delete(id).then((r) => r.affected);
    },
  },
  Query: {
    style: (_, { id }) => Style.findOne(id),
    styles: async (
      _,
      { input }: { input: { limit?: number; offset?: number; search?: string } }
    ) => {
      const { limit, offset, search } = input ?? {};
      const take = limit ?? 10;
      const skip = offset ?? 0;
      const items = await Style.find({
        skip,
        take,
        where: search && {
          id: Like(search + "%"),
        },
        order: {
          id: "ASC",
        },
      });

      return { items, nextOffset: items.length === take ? skip + take : null };
    },
  },
};
