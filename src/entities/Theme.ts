import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Themes for user to choose from.
 * Unlike Layout, Themes don't have separated styles.
 * Styles are included in themes inside `<style amp-custom></style>`
 * in plain CSS.
 *
 * User can rewrite a Theme in an editor,
 * therefore their imports are limited to a boilerplate.
 */
@Entity()
export default class Theme extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Title, to show to user
   */
  @Column({ nullable: false })
  title: string;

  /**
   * Short description
   */
  @Column({ nullable: true, type: "text" })
  description?: string;

  /**
   * Liquid template,
   * @see file `apm/themes/default.liquid`
   */
  @Column({ type: "text" })
  template: string;

  /**
   * Theme preview,
   * generated on save
   */
  @Column({ type: "simple-json", nullable: true })
  preview: { url: string; width: number; height: number };

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated?: Date;
}
