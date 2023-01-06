import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Build from "./Build";

export enum beeHouseStatus {
  Empty = "ว่าง",
  Build = "สร้างรัง",
  Keep = "เก็บเกี่ยว",
}

export default class BeeHouse extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ serializeAs: null })
  public status: number;

  @column()
  public user_id: number;

  @column()
  public tag: number;

  @column()
  public date: Date;

  @column()
  public house_status: beeHouseStatus;

  @belongsTo(() => Build)
  public build: BelongsTo<typeof Build>;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @hasMany(() => Build, {
    foreignKey: "bee_houses_id",
  })
  public builds: HasMany<typeof Build>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
