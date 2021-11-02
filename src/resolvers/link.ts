import {Link, SaveLinkType} from "../entities/Link";
import User from "../entities/User";
import {In} from "typeorm";

export default {
  Mutation: {
    createLink: (_, { input }, { user }: { user: User }) => {
      const link = new Link();
      delete input["id"];
      Object.assign(link, input);
      link.user = user;
      return link.save();
    },

    createLinks: (_, { input }: {input:[SaveLinkType]}, { user }: { user: User }) : Promise<{id:string}[]> => {
        input.forEach(value => value.user = user);
        return Link.batchUpdateCreate(input);
    },

    updateLink: (_, { id, input }, { user }: { user: User }) => {
      return Link.update({ id, user }, { ...input });
    },
    deleteLink: (_, { id }: {id:[string]}, { user }: { user: User }) => {
      return Link.delete({id:In(id), user});
    },
  },
};
