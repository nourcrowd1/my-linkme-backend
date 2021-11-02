import {
  BaseEntity, Between,
  Column,
  CreateDateColumn,
  Entity, Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  getManager, EntityManager, SelectQueryBuilder
} from "typeorm";
import User from "./User";

type SearchAllByDate = {
  dateFrom: string
  dateTo: string
  event: string
  target:string
}

/**
 *  Analytics
 */
@Entity()
class Analytics extends BaseEntity {
  /**
   * String uuid for analytics.
   * Harder to temper
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * Id of the User
   */
  @Index()
  @Column({ nullable: false })
  user_id?: number;

  /**
   * Event
   */
  @Column({ nullable: false })
  event: string;

  /**
   * Title
   */
  @Column({ nullable: false })
  title: string;

  /**
   * Target
   */
  @Column({ nullable: false })
  target: string;

  /**
   * Url
   */
  @Column({ nullable: true })
  url: string;

  /**
   * Country
   */
  @Index()
  @Column({ nullable: true })
  country: string;

  @CreateDateColumn()
  created: Date;

  static async findByDate(input:SearchAllByDate, user: User) {
    const {dateFrom, dateTo, event} = input ?? {};
    const where:any = {user_id:user.id};
    if (input.dateFrom && input.dateTo) {
      where.created = Between(dateFrom, dateTo);
      delete input.dateTo;
      delete input.dateFrom;
    }

    return  await Analytics.find({
      where: Object.assign(where, input),
    });
  }

  static findByDateGroupedByCountry(input: {dateFrom: string, dateTo:string}, user: User) : Promise<[{count: string, event:string, country: string} ] | any> {
    let {dateFrom, dateTo} = input;
    return  getManager()
        .createQueryBuilder()
        .select(['event', 'country', 'COUNT (id)'])
        .from(Analytics, "analytics")
        .groupBy("country, event")
        .where("user_id = :user_id AND created BETWEEN :dateFrom AND :dateTo", { user_id: user.id, dateFrom, dateTo })
        .orderBy('count', 'DESC')
        .getRawMany();
  }
}


export {
  SearchAllByDate,
  Analytics
};

