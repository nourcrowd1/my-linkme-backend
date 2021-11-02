import User from "../entities/User";
import {HTTPError} from "../errors";
import {getConnection, ILike} from "typeorm";
import Partner from "../entities/Partner";
import {isEqual, differenceWith} from "lodash";
import cron from "node-cron";
import enums from "../enums";

export default {
  Mutation: {
    createPartner: async (_, { input }, ctx) => {
      const partner = new Partner();
      delete input["id"];
      if (!input.links) input.links = [];
      input.links.forEach(link => link.type = input.type);
      Object.assign(partner, input);
      return partner.save();
    },
    updatePartner: async (_, { id, input }: {id:number, input: any}, { user }: { user: User }) => {
      try {
        if (!input.links) input.links = [];
        input.links.forEach(link => link.type = input.type);

        const currentPartner = await Partner.findOne(id);
        const diff = differenceWith(input.links, currentPartner.links, isEqual);
        if (diff) {
          await getConnection()
              .createQueryBuilder()
              .update(User)
              .set({ partnerLinksSynced: false})
              .where('ext_provider = :partner_type', {partner_type: enums.PARTNER.CROWD1})
              .execute();
        }

        await Partner.update(id, { ...input });

        return await Partner.findOne(id);
      }
      catch (err) {
        throw new HTTPError(500, err.message);
      }
    },
    deletePartner: (_, { id }: {id:number} , { user }: { user: User }) => {
      return Partner.delete(id);
    },
  },
  Query: {
    partner: (_, { id }) => Partner.findOne(id),
    partners: async (
        _,
        { input }: { input: { limit?: number; offset?: number; search?: {field:string, value:string}; order?: {field:string, direction:string} } }
    ) => {
      const { limit, offset, search, order } = input ?? {};
      const take = limit ?? 10;
      const skip = offset ?? 0;

      const items = await Partner.findAndCount({
        skip,
        take,
        order: order ? {[order.field]:order.direction} : {id:"DESC"},
        where: search ? {[search.field]: ILike(`%${search.value}%`)} : null
      });

      return { items:items[0], nextOffset: items[0].length === take ? skip + take : null, total:items[1] };
    },
  },
};
