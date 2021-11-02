import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Entity,
} from "typeorm";
import Page from "./Page";
import Style from "./Style";

/**
 * Liquid Layout for a page
 * Can be imported from another layout
 */
@Entity()
export default class Layout extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: "text" })
  template: string;

  @ManyToOne(() => Style, (style) => style.layouts, {
    eager: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "style_id" })
  style: Style;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated?: Date;
}
