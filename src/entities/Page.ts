import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Entity,
  Index, UpdateResult,
} from "typeorm";
import {InputError} from "../errors";

type PageInput = {
  id?:string
  language?:"sv" | "en" | "ar" | "ru"
  path:string
  content:string
  deletable:boolean
}

/**
 * Static html page
 * Not a user page
 * Will have url made of language and and it's path:
 *
 * `/en/privacy-policy`
 *
 * Note: When pages is saved,
 * it's compiled and saved to Redis
 * and served primarily from there
 */
@Entity()
@Index(["language", "path"], { unique: true })
export default class Page extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  /**
   * Languages
   */
  @Column({ type: "enum", enum: ["sv", "en", "ar", "ru"], default: "en" })
  language: "sv" | "en" | "ar" | "ru";

  /**
   * Page path
   */
  @Column({ nullable: false })
  path: string;

  /**
   * Markdown content with YAML parameters:
   * ```md
   * ---
   * title: 'Page Title'
   * description: 'Page Description'
   * some-other-parameter: true
   * ---
   * # Page Title
   *
   * Page content
   *
   * ```
   */
  @Column({ type: "text" })
  content: string;


  @Column({ type: "boolean" , default: true, nullable: true})
  deletable: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated?: Date;

  static savePage(input: PageInput, id?: number): Promise<Page | UpdateResult> {
      Page.sanitizePageInput(input);
      input.deletable = Page.isPageDeletable(input.path);
      if (id) {
        return  Page.update(id, input);
      }
      const page = new Page();
      Object.assign(page, input);
      return page.save();
  }

  static async deletePage(id: number) {
    const page = await Page.findOne(id);
    if (!page.deletable) {
      throw new InputError('deletetable', 'page_not_deletetable');
    }

    return Page.delete(id);
  }

  static sanitizePageInput(input: PageInput) : void {
    if (input.path) {
      if (input.path.charAt(0) !== '/') {
        input.path = `/${input.path}`
      }
    }
  }

  static notDeletablePagesPath(): string[] {
    return [
      '/',
      '/faq',
      '/terms'
    ]
  }

  static isPageDeletable(path: string): boolean {
    return !Page.notDeletablePagesPath().includes(path);
  }

}
