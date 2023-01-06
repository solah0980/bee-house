import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Build from "./Build";

export default class Keep extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public build_id: number;

  @column()
  public date: Date;

  @belongsTo(() => Build)
  public build: BelongsTo<typeof Build>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
