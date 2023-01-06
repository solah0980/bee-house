import { DateTime } from "luxon";
import {
  BaseModel,
  beforeSave,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Hash from "@ioc:Adonis/Core/Hash";
import BeeHouse from "./BeeHouse";

export enum userRole {
  Admin = "admin",
  User = "user",
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ serializeAs: null })
  public status: number;

  @column()
  public citizenId: string;

  @column()
  public name: string;

  @column()
  public lastName: string;

  @column()
  public gender: string;

  @column()
  public email: string;

  @column()
  public birthDate: Date;

  @column()
  public phone: string;

  @column()
  public address: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public imagePath?: string | null;

  @column()
  public role: userRole;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => BeeHouse, {
    foreignKey: "user_id",
  })
  public bee_houses: HasMany<typeof BeeHouse>;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}
