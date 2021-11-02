import { Readable } from "stream";
import { InputError } from "./errors";
import {IncomingMessageLinkTree} from "./classes";
import Token from "./entities/Token";
import cookie from "cookie";
import _ from 'lodash';
export const normalizeEmail = (email: string): string => {
  const normalizedEmail = email.trim().toLowerCase();
  if (
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  )
    throw new InputError("email", "invalid_email");
  return normalizedEmail;
};

export const normalizeUsername = (username: string): string => {
  const normalizedUsername = username.trim().toLowerCase();
  if (!/^[a-z]+[a-z0-9-_\.]+$/i.test(username))
    throw new InputError("username", "invalid_username");
  return normalizedUsername;
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export function base64(str: string) {
  return Buffer.from(str, "utf-8").toString("base64");
}
export async function addUserToReq(req: IncomingMessageLinkTree) {
  const cookies = cookie.parse(req.headers.cookie || '');
  if (cookies.token) {
    const token: Token = await Token.findOne(cookies.token.trim()).catch(() => null);
    if (token?.id) req.user = token.user;
  }

}

const raw = (stream: Readable) => {
  return new Promise((resolve, reject) => {
    const data: Array<Buffer> = [];
    stream.on("data", (chunk: Buffer) => {
      data.push(chunk);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(data));
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
};

export const body = {
  raw,
  json: (stream: Readable) => {
    return raw(stream).then(JSON.parse);
  },
};


export function buildLinkWithSublinks(links) {
  let parsedLinks = []
  links.forEach((link: any) => {
    if (link.group_id && !link.is_folder) return;
    if (!link.is_folder) {
      parsedLinks.push(link)
    } else {
      link.subLinks = links.filter(l => link.group_id === l.group_id && !l.is_folder);
      parsedLinks.push(link)
    }
  });

  parsedLinks = _.orderBy(parsedLinks, 'list_order', 'asc');
  parsedLinks.forEach(link => {
    if (link.subLinks) link.subLinks = _.orderBy(link.subLinks, 'list_order', 'asc');
  })
  return parsedLinks;
}