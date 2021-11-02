import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Entity,
  OneToMany,
} from "typeorm";
import Layout from "./Layout";

/**
 * Styles for the layouts in SCSS/SASS.
 * Can me imported with `@use` `@import`
 */
@Entity()
export default class Style extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated: Date;

  @OneToMany(() => Layout, (layout) => layout.style)
  layouts: Layout[];
}
