import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { beeHouseStatus } from "App/Models/BeeHouse";

export default class extends BaseSchema {
  protected tableName = "bee_houses";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("status", 1).defaultTo(1);
      table.integer("tag");
      table.enu("house_status", Object.values(beeHouseStatus), {
        useNative: false,
        enumName: "house_status",
      });
      table
        .integer("user_id")
        .unsigned()
        .references("users.id")
        .onDelete("CASCADE");
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.date("date");
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
