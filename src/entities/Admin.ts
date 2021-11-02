import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { genSalt, hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { normalizeEmail } from "../lib";
import { InputError } from "../errors";
import { token } from "../config";
/**
 * First login & emergency account
 */

const superuser = process.env.SUPERUSER_EMAIL &&
  process.env.SUPERUSER_PASSWORD && {
    id: 1,
    name: "superuser",
    email: normalizeEmail(process.env.SUPERUSER_EMAIL),
    password: process.env.SUPERUSER_PASSWORD,
  };

/**
 *  Administrator account
 */
@Entity()
export default class Admin extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  pwhash: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated?: Date;

  static async createAccount(input: { email: string; password: string }) {
    const user = Admin.validate(input);
    const salt = await genSalt();
    user.pwhash = await hash(input.password, salt);
    return user.save();
  }

  static async updateAccount(
    id: number,
    input: {
      email: string;
      password: string;
    }
  ) {
    const user = Admin.validate(input, id);
    if (input.password) {
      const salt = await genSalt();
      user.pwhash = await hash(input.password, salt);
    }
    return user.save();
  }

  static async checkCredentials(input: { email: string; password: string }) {
    const email = normalizeEmail(input.email);

    if (
      superuser &&
      email === superuser.email &&
      input.password === superuser.password
    ) {
      // Logged in as superuser
      const admin = superuser;

      return {
        admin,
        token: sign({ admin }, token.key, {
          audience: token.audience,
          expiresIn: 24 * 60 * 60,
          issuer: token.issuer,
        }),
      };
    }
    const admin = await Admin.findOne({ email });
    if (!admin?.id) new InputError("email", "wrong_email");

    if (!(await compare(input.password, admin.pwhash))) {
      throw new InputError("password", "wrong_password");
    }

    return {
      admin,
      token: sign({ admin }, token.key, {
        audience: token.audience,
        expiresIn: 24 * 60 * 60,
        issuer: token.issuer,
      }),
    };
  }

  static validate(
    input: {
      email: string;
      password: string;
    },
    id?: number
  ) {
    if (!id && !input.password) throw new InputError("password", "required");
    const user = new Admin();
    if (id) user.id = id;
    if (!id || input.email) user.email = normalizeEmail(input.email);
    return user;
  }
}
