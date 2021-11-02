import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index, ManyToMany,
} from "typeorm";
import Partner from "./Partner";
import User from "./User";
import Subscription from "./Subscription";

/**
 * User subscription information.
 * Currently linked only to PayPal.
 * Subscription.id = Paypal.Subscription.id
 */
@Entity()
@Index(["invoice_id",], { unique: true })
export default class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  invoice_id: string;


  /**
   * Invoice owner,
   * delete all the invoice if user is deleted
   */
  @ManyToOne(() => User, (user) => user.payments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: false })
  total_amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: "date", nullable: true })
  create_time: Date;

  /**
   * Payment subscription,
   * delete all the links if user is deleted
   */
  @ManyToOne(() => Subscription, (subscription) => subscription.payments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true, // FIXME: Creates dangling links
  })
  @JoinColumn({ name: "billing_id" })
  billing: Subscription;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated: Date;

  static add(invoice) {
    return Payment.save(invoice);
  }

}
