import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index, getConnection, OneToMany, DeleteResult,
} from "typeorm";
import Partner from "./Partner";
import User from "./User";
import Payment from "./Payment";
import paypal from "../vendors/paypal";

/**
 * User subscription information.
 * Currently linked only to PayPal.
 * Subscription.id = Paypal.Subscription.id
 */
@Entity()
@Index(["ext_id", "origin", "partner_id"], { unique: true })
export default class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  ext_id: string;

  @Column({ nullable: true })
  plan_id: string;

  @Column({
    type: "enum",
    enum: ["paypal", "partner"],
  })
  origin: "paypal" | "partner";

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  /**
   * NOTE: PayPal sends this
   * values in UPPERCASE
   */
  @Column({
    type: "enum",
    enum: [
      "approval_pending",
      "approved",
      "active",
      "suspended",
      "cancelled",
      "expired",
    ],
  })
  status:
    | "approval_pending"
    | "approved"
    | "active"
    | "suspended"
    | "cancelled"
    | "expired";

  @Column({ nullable: true })
  status_change_note: string;

  @Column({ type: "date", nullable: true })
  start_time: Date;

  @Column({ type: "date", nullable: true })
  end_time: Date;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated: Date;

  @ManyToOne(() => Partner, (partner) => partner.subscriptions, {
    nullable: true,
    eager: true
  })
  @JoinColumn({ name: "partner_id" })
  partner?: Partner;

  @Column({ nullable: true })
  partner_id?: string;

  @OneToMany(() => Payment, (payment) => payment.billing, {
    eager: true,
    cascade: true,
  })
  payments: Payment[];

  static async saveSubscriptionWithUserAttach(input, user: User) {
    const subscription = new Subscription();
    if (!input.user) input.user = user;
    Object.assign(subscription, input);
    await subscription.save();
    user.subscription = subscription;
    await user.save();
    return subscription;
  }

  static async isUserSubscriptionActive(user: User): Promise<boolean> {
    let isActive = false;
    const subscription = await Subscription.find({
      user: user,
      status: "active",
    });
    if (!subscription) return isActive;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    subscription.forEach(value => {
      if (value.end_time === null) {
        isActive = true;
        return;
      } else {
        let endDate = new Date(value.end_time);
        endDate.setHours(0, 0, 0, 0);
        if (endDate >= currentDate) {
          isActive = true;
          return;
        }
      }
    });

    return isActive;
  }

  static async createPartnerSubscription(input: {partner:Partner, ext_id:string, user: User, status?: string | any}): Promise<Subscription> {
    const subscription = {
      ext_id: input.ext_id,
      origin: 'partner',
      user: input.user,
      status: input.status || 'active',
      start_time: new Date(),
      partner: input.partner
  };

    return Subscription.saveSubscriptionWithUserAttach(subscription, input.user);
  }

  static async deleteExpiredSubscription(): Promise<DeleteResult>{
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Subscription)
        .where("end_time < :currentDate", { currentDate })
        .execute();
  }

  static async cancelPayPalSubscriptionByID(subscriptionId: string, user:User): Promise<{error?: string, status?: boolean}> {
    const currentSubscription = await Subscription.findOne(subscriptionId, {relations:['user']});
    if (!currentSubscription) return {'error':'subscription not exist'};

    if (currentSubscription.user.id !== user.id) return {'error':'not_belong_to_you'};
    return Subscription.cancelPayPalSubscription(currentSubscription);
  }
  
  static async cancelPayPalSubscription(currentSubscription: Subscription) :Promise<{error?: string, status?: boolean}>{
    const resource = await paypal.execute({
      method: "POST",
      path: `/v1/billing/subscriptions/${currentSubscription.ext_id}/cancel`,
      body:{reason:'no need'},
      returnJson:false
    });

    if (resource) {
      await Subscription.delete(currentSubscription.id);
      return {status:true};
    }
    else {
      return {'error':'Can\'t remove subscription from PayPal'};
    }
  }

  static async cancelPayPalSubscriptionByUser(user: User): Promise<{error?: string, status?: boolean}> {
    const currentSubscription = await Subscription.findOne({user:user, origin:'paypal'});
    if (currentSubscription) {
      return await Subscription.cancelPayPalSubscription(currentSubscription);
    }

    return {error: 'not_exist'}
  }

  static async cancelUserSubscription(user: User): Promise<{status?:boolean, error?:string}> {
    try {
      const currentSubscription = await Subscription.findOne({user:user});
      if (currentSubscription) {
        if(currentSubscription.origin === 'paypal') {
          await Subscription.cancelPayPalSubscription(currentSubscription);
          return {status:true};
        }
        else {
          await Subscription.delete(currentSubscription.id);
          return {status:true};
        }
      }

      return {error: 'not_exist'}
    }
    catch (err) {
      throw new Error(err);
    }
  }

  static async findAndDeleteSubscriptionFromDB(ext_id: string) {
    try {
      let subscription = await Subscription.findOne({ext_id});
      if (subscription) {
        await Subscription.delete(subscription.id);
        return {status:true};
      }
      return {error: 'not_exist'}
    }
    catch (err) {
      throw err;
    }
  }

}
