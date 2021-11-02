import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import moment from "moment";

/**
 * User login tokens.
 */
@Entity()
export default class Token extends BaseEntity {
  /**
   * Authorization: Bearer {token.id}
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.tokens, {
    eager: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ default: () => "(NOW() + interval '1 month')", type: "timestamp" })
  expires: any;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated?: Date;

  static isTokenExpires(tokenExpireDate: string): boolean {
    const date = moment(tokenExpireDate).unix();
    return date < moment().unix();
  }
}
