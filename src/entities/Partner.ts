import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Subscription from "./Subscription";
import User from "./User";
import enums from "../enums";

/**
 * Platform Partner
 */
@Entity()
@Index(["type"], { unique: true })

export default class Partner extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: "text" })
  note?: string;

  @Column({
    type: "enum",
    nullable: true,
    enum: [
      enums.PARTNER.CROWD1
    ],
  })
  type:"crowd1" | "";

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn({ nullable: true })
  updated: number;

  @OneToMany(() => Subscription, (subscription) => subscription.partner)
  subscriptions: Subscription[];

  @OneToMany(() => User, (user) => user.partner)
  users: User[];

  @Column({ nullable: true, type: "json" })
  links: any;

  static async findByType(type, createIfNotExist = true): Promise<Partner | null> {
    let partner = await Partner.findOne({ type });
    if (!partner?.id && createIfNotExist) {
      partner = new Partner();
      partner.name = type;
      partner.type = type;
      await partner.save();
    }

    return partner;
  }

  static getDefaultCrowd1Link()  {
    return [
      {
        _id: Date.now(),
        label:'Crowd1',
        url:'http://crowd1.com/invite?user=',
        type: enums.PARTNER.CROWD1,
        icon: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAE8ElEQVRYR72Xa2yTZRTHf2+3taNdL2s7tm7dHCBTYBOG4+qCg0W5jxkkMSExiLdENEpIvCaG+JFgNCHgNfrBGIOKiTImDBCNcglhjA2MXGTgYLRs3bpbS7d2fczzlg62dt00G+fbeznP/5z/ey7/VwEwGnNsisJLCsrTQC6gk/fHxQT1Isx2rS/wo2IyOa0aISrCCs8pKIVAGpA0LsCRQz3ASQE7FYsxd4tArEahdJxB78pHhIRQ9ilmU+5lwA7CNI7Zxju6VTGbnGI0oEnmCRiK8kidnElfSye+2isEW7sGucpnhtn5aHQp+BqaCFx0Ee4NDnO8CI0KXF+Yi3X1wxgXFqB1WAh1+HHvqsG7r27g8BSHhcwNZaSvLEbRJuM/dw1vdR1dv/0VE2Q0moTgSkoSpoUF2NeXYl40jWSrrMWIuXbsx7XrIKG2bvU6rWQyzrcrMZU+qF7LjAONLbT/cJK2PSfpvd4Ww0BCcEt5EZkvlmOcOwWN/k739Xf6ub5tL61f/0HY36seqsuzk/P6aqxrSlTao9Z7rY2WL47g+fZEDAPDgkuqszevxPJYEZrUyGEi2I/vzFW8++vxVp0mcKVlAERJ1mAonoStsgTL8lnonLaBZ51H/qR520/01F4ZlH1ccI1ei+PlZWRuLBugOuzvw1vTgGf3MXynGgl1+uMWki7XhqlsOvZ18zEU56NoNLR+cxT3zppBwUrnuODG+VPJeWsNpgUFke8ngavruPn5L/jONqkMJDKNQYdpwVSMCwoIB4J0HDqrFuBQvxhwmXX2ayuYuKGMZItexeg+fokbH+yj6+iFEYGjQcnvnmTRI3pD9HfdQoTDIxdc6tQsct9dS/rSmQNZ3/iwmpYvfx2W6oQ0JHgYk7l5SaFatWmzJ6lugUtumt7bQ8eB+v+LMaxfDHjG+lIcry4nNT9DdZKgzdur8NX/M/7gmS+U49i0VJ1k0jzfnUDSLhkYa4vJfOIzZTheWYbOab334LYn56nVPqHAcZv2Bpq37703tJsWTcP5RgVpc6ao4L1NHq5t/Z72qtNjzXrskNHmpJO3dZ06o6WJUJibnx3G/fFB+lwdYxpAzDeXMzp7yyqyni8nyTThdru51Ir3Vp9JsJ8HxyU3olbO93CYoLszrl/c8TqUepl999ELuHYeUKfd8AIhEkCK3Yhl6UzMi6eDRoN3by0dh8+pk+5uiwsuM87cuBhZ+dGWk4Ddxy6qrTecQJDZ6mdI4TFbFRW6/Ax1sXh/PkPz+1X4G5pGBpdvSMfszSuwVpSQZIjs8qhA6DnViGf3cXy1jYj+yMyWOyF9RTG2tfNIK84fJDyGG1QJxYRUJ1mbHsdcNmMggGgQUsXIQgx5IkrG8NB95LxZgXnJDDXbqN06fwP3J4fU/T90DSeWUcka9EV52J6YS/qq4kECwbXjAK6Pau6Az8rH+U4l5kenR7okGMJ/7rqqdiTtQ8WmfGdUAlIKBOMjD2ApLyS1wEF/ew/uTw+rezq6o2WdZDy1EGvlHAgLek5dpuv38/TUXSXU3hO3RRWz0elHQeqk5ERNLPdz6uSJaJ1W+rsD3LroijlUFmfq/VkgBIG/bxJs6Yq7x6M4EvwsCtlAZJjfK1NoluDPorAOKB8p+zGMqw/BV4rdbjf29ekWKULZgMJi4I7s/G9oo/nzCQohfxTFQYH49F/tWRKaoxMXiQAAAABJRU5ErkJggg==" alt="" />'
      },
      {
        _id: Date.now(),
        label:'Miggster',
        url:'http://miggster.com/invite?user=',
        type: enums.PARTNER.CROWD1,
        icon:'<img src="data:image/png;base64,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" alt="" />'
      }

    ]
  }

  static async saveDefaultCrowd1Links(partner: Partner): Promise<Partner> {
    partner.links = Partner.getDefaultCrowd1Link();

    await partner.save();
    return partner.links;
  }
}
