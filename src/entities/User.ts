import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from "typeorm";
import { genSalt, hash, compare, compareSync } from "bcryptjs";
import { normalizeEmail, normalizeUsername } from "../lib";

import {Link} from "./Link";
import Token from "./Token";
import Theme from "./Theme";
import {HTTPError, InputError, NotFoundError} from "../errors";
import Subscription from "./Subscription";
import Partner from "./Partner";
import Payment from "./Payment";
import tokenParser from "../vendors/token";
import {find, get, filter} from "lodash";
import enums from "../enums";
import {difference, map} from "lodash";

const TokenParser = new tokenParser({
  'user.username': {
    'name': 'User name',
    callback: (data) => {
      let userName = get(data, 'parserData.user.username', '');
      userName = userName.replace('@', '');
      return userName;
    }
  },
  'user.email': {
    'name': 'User email',
  },
  'user.name': {
    'name': 'User name',
  },
});

type ImageItem = {
  url: string;
  width: number;
  height: number;
};
@Entity()
@Index(["ext_id", "ext_provider"], { unique: true })
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: false })
  pwhash: string;

  @Column({ type: "simple-json", nullable: true })
  avatar: { url: string; width: number; height: number };

  @Column({ nullable: true, type: "text" })
  intro: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated?: Date;

  @OneToMany(() => Link, (link) => link.user, {
    eager: true,
    cascade: true,
  })
  links: Link[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @ManyToOne(() => Theme, { eager: true,  onDelete: "SET NULL"})
  @JoinColumn({ name: "theme_id" })
  theme: Theme;

  @Column({ nullable: true, type: "text" })
  template: string;

  @OneToOne(() => Subscription, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "sub_id" })
  subscription: Subscription;

  @OneToMany(() => Payment, (invoice) => invoice.user, {
    eager: true,
    cascade: true,
  })
  payments: Payment[];

  @ManyToOne(() => Partner, (partner) => partner.users, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "partner_id" })
  partner: Partner;

  //oAuth
  @Column({ nullable: true })
  ext_id?: string;

  @Column({ nullable: true })
  ext_provider?: string;

  @Column({ nullable: true, default:true })
  enable_partner_links?: boolean;

  @Column({ nullable: true, default:false })
  isFreeze?: boolean;

  @Column({ nullable: true, default:false })
  partnerLinksSynced?: boolean;

  /**
   * Language code to place in the page header
   */
  @Column({ nullable: true, type: "varchar", length: 5 })
  lang?: string;

  static async createAccount(input: {
    email: string;
    username: string;
    password: string;
  }) {
    const fields = User.validate(input);
    fields.pwhash = await User.generatePasswordHash(input.password);
    const user = new User();
    Object.assign(user, fields);
    await user.save();
    const token = new Token();
    token.user = user;
    await token.save();

    return { user, token: token.id };
  }

  static async createUser(input: {
    email: string;
    username: string;
    password: string;
  }) {
    const fields = User.validate(input);
    fields.pwhash = await User.generatePasswordHash(input.password);
    const user = new User();
    Object.assign(user, fields);
    return await user.save();
  }

  static async generatePasswordHash(password: string) : Promise<string> {
    const salt = await genSalt();
    return await hash(password, salt);
  }

  static async checkCredentials(input: { email: string; password: string }) {
    try {
      const email = normalizeEmail(input.email);
      const user = await User.findOne({ email });
      if (!user?.id) throw new InputError("email", "not_found");
      if (!(await compare(input.password, user.pwhash))) {
        throw new InputError("password", "wrong_password");
      }
      const token = new Token();
      token.user = user;
      await token.save();
      return { user, token: token.id };
    }
    catch (err) {
      throw err;
    }
  }

  static comparePassword(password: string, currentHashPassword: string) : boolean {
    return compareSync(password, currentHashPassword)
  }

  /**
   *  Changed User password. User current password to compare with new.
   *  
   * @param userId: number
   * @param currentPassword: string
   * @param newPassword:string
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string) : Promise<User> {
    const user = await User.findOne({id:userId});
    if (User.comparePassword(currentPassword, user.pwhash)) {
      return User.updateAccount(userId, {password:newPassword});
    }
    else {
      throw new InputError("password", "passwords_not_math");
    }
  }

  static async updateAccount(
    id: number,
    {
      password,
      ...input
    }: {
      email?: string;
      username?: string;
      password?: string;
      image?: { url: string; width: number; height: number };
      theme?: string;
      name? :string;
      enable_partner_links? :boolean;
      isFreeze?: boolean
    } & any
  ) {
    try {
      const user = await User.findOne(id);

      if (!user?.id) throw new NotFoundError("user", "not_found");

      const linksIdsForRemove = [];
      user.links.forEach(link => {
        const existing = find(input.links, {id:link.id});
        if (existing) existing.source  = link.source;
        if (!existing) linksIdsForRemove.push(link.id);
      });

      if (linksIdsForRemove.length) await Link.delete(linksIdsForRemove);

      if (input.links && input.links.length) {
        input.links.forEach(value => {
          if (!value.url) value.url = '';
          value.user = user
        });
        await Link.batchUpdateCreate(input.links);
      }

      if (user.ext_provider === enums.PARTNER.CROWD1) {
        delete input.username;
        delete input.email;
        await User.actionsOnChangeEnablePartnersLinkField(user, input);
      }

      const fields = { ...input, ...User.validate(input, id) };
      if ("theme" in input) {
        // TODO: should we throw an error here?
        fields.theme = input.theme ? await Theme.findOne(input.theme) : null;
      }
      if (password) {
        fields.pwhash =  await User.generatePasswordHash(password);
      }

      Object.assign(user, fields);
      await user.save();
      return await User.findOne(id);
    }
    catch (err) {
      throw err;
    }
  }

  static validate(
    input: Partial<{
      email: string;
      username: string;
      password: string;
      image: ImageItem;
    }>,
    id?: number
  ) {
    const fields: Partial<User> = {};
    if (!(id || input.password))
      throw new InputError("password", "password_required");
    if (!id || "email" in input) fields.email = normalizeEmail(input.email);
    if (!id || "username" in input)
      fields.username = normalizeUsername(input.username);
    return fields;
  }

  static async findByEmail(email, dataForCreate?: {} | null): Promise <User | null> {
    let user = await User.findOne({ email });
    if (user?.id) return user;
    if (dataForCreate) {
      user = new User();
      user = Object.assign(user, dataForCreate);
      await user.save();
    }

    return user;
  }

  static updateUserNameForCrowd1(user: User, emailFromToken:string): void {
    let userName = `@${emailFromToken.split("@").shift()}`;
    if (user.username === null || user.username === '') {
      user.username = userName;
    }
    else {
      if (user.username.substring(0, 1) !== '@') {
        user.username = `@${user.username}`;
      }
    }
  }

  static async addPartner(user: User, partner: Partner) : Promise<boolean> {
    try {
      let links = get(partner, 'links', []) || [].length ? partner.links : await Partner.saveDefaultCrowd1Links(partner);
      let linkForSave = [];
      links.forEach(link => {
        const existingLink = find(user.links || [], {source:`${link._id}`});
        if (!existingLink) {
          linkForSave.push({
            user: user,
            url: TokenParser.findAndReplace(link.url, {user}),
            icon:link.icon,
            type:partner.type,
            source:link._id,
            label: link.label
          });
        }
      });

      if (linkForSave.length) await Link.batchUpdateCreate(linkForSave);
      return true;
    }
    catch (err) {
      throw new Error(err)
    }
  }

  static async syncPartnerLinks(): Promise<boolean> {
    try {
      const users = await User.find({where:{partnerLinksSynced:false, ext_provider:enums.PARTNER.CROWD1}, relations:['links']});
      if (users && users.length) {
        const partner = await Partner.findOne({where:{type:enums.PARTNER.CROWD1}});
        const partnerLinksIds = map(partner['links'], '_id');
        for (let index in users) {
          const user = users[index];
          await User.oneUserSyncPartnerLinks(user, partner, partnerLinksIds);
        }
      }
      return true;
    }
    catch (e) {
      throw e;
    }
  }

  static async oneUserSyncPartnerLinks(user, partner, partnerLinksIds) {
    let linkForSave = [];
    const userPartnerLinks = filter(user.links, {type:enums.PARTNER.CROWD1});
    const userLinksSourceIds = map(userPartnerLinks, 'source');

    const sourceIdsForDelete = difference(userLinksSourceIds, partnerLinksIds);
    const linksIdsForRemove = [];
    if (sourceIdsForDelete.length) {
      sourceIdsForDelete.forEach(source => {
        const link = find(user.links, {source});
        linksIdsForRemove.push(link.id);
      });
      if (linksIdsForRemove.length) {
        await Link.delete(linksIdsForRemove);
      }
    }

    const sourceIdsForAdd = difference(partnerLinksIds, userLinksSourceIds);
    if (sourceIdsForAdd.length) {
      sourceIdsForAdd.forEach(_id => {
        const link = find(partner['links'], {_id});
        linkForSave.push({
          user: user,
          url: TokenParser.findAndReplace(link.url, {user}),
          icon:link.icon,
          type:partner['type'],
          source:link._id,
          label: link.label,
          order_id: link.order_id,
          is_folder: link.is_folder,
        });
      })
    }

    user.links.forEach((link, index) => {
      if (link.type === null) {
        link.user = user;
        linkForSave.push(link);
      }
      let partnerLink = find(partner['links'], {_id:link.source});
      if (partnerLink) {
        linkForSave.push({
          user: user,
          url: TokenParser.findAndReplace(partnerLink.url, {user}),
          icon:partnerLink.icon,
          type:partner['type'],
          label: partnerLink.label,
          id:link.id,
          order_id: link.order_id,
          is_folder: link.is_folder,
        });
        delete user.links[index];
      }
    });

    if (linkForSave.length) await Link.batchUpdateCreate(linkForSave);
    await User.update(user.id, {partnerLinksSynced:true});
    delete user.links;
  }

  static async actionsOnChangeEnablePartnersLinkField(oldUser, input) {
    const isPartnerLinksIsChanged = input.enable_partner_links !== undefined && oldUser.enable_partner_links !== input.enable_partner_links;
    if (!isPartnerLinksIsChanged) return;
    if (input.enable_partner_links) {
      const partner = await Partner.findOne({where:{type:enums.PARTNER.CROWD1}});
      const partnerLinksIds = map(partner['links'], '_id');
      await User.oneUserSyncPartnerLinks(oldUser, partner, partnerLinksIds);
    }
    else {
     const links = filter(oldUser.links, (item => {
       if (item.type !== enums.PARTNER.CROWD1) return item;
     }));
      oldUser.links = links;
    }
  }
}
