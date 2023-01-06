import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import BeeHouse from "./BeeHouse";
import Keep from "./Keep";

export default class Build extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public bee_houses_id: number;

  @column()
  public date: Date;

  @belongsTo(() => BeeHouse)
  public beeHouse: BelongsTo<typeof BeeHouse>;

  @hasOne(() => Keep, {
    foreignKey: "build_id",
  })
  public keep: HasOne<typeof Keep>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
