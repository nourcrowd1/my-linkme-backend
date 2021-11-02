import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, getConnection,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";

type SaveLinkType = {
    id: string
    user: User
    url:string
    label: string
    icon: string
    user_id: number
    source: any
}

/**
 * User link
 */
@Entity()
class Link extends BaseEntity {
  /**
   * String uuid for analytics.
   * Harder to temper
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;
  /**
   * Link owner,
   * delete all the links if user is deleted
   */
  @ManyToOne(() => User, (user) => user.links, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true, // FIXME: Creates dangling links
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  /**
   * Link URL, full
   */
  @Column({ nullable: false })
  url: string;

  /**
   * Link label
   */
  @Column({ nullable: false })
  label: string;

  /**
   * Link type
   */
  @Column({ nullable: true })
  type: string;
  /**
   * Link source
   */
  @Column({ nullable: true })
  source: string;


  @Column({ nullable: true })
  is_folder: boolean;

  @Column({ nullable: true })
  parent_id: string;

  @Column({ nullable: true })
  group_id: string;

  /**
   * SVG Icon
   */
  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated: number;

  /**
   * If the order was explicitly set,
   * the item with be displayed in this order.
   * Otherwise, NULL will be treated as last:
   *
   * ORDER BY list_order ASC NULLS LAST
   */
  @Column({
    type: "integer",
    nullable: true,
  })
  list_order?: number;

  static  batchUpdateCreate(links: [SaveLinkType] | any) : Promise<{id:string}[]> {
    const repository = getConnection().getRepository(Link);

    return repository.save(links);
  }

}

export {
  Link,
  SaveLinkType
};
