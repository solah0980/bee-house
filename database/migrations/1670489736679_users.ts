import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { userRole } from "App/Models/User";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("status", 1).defaultTo(1);
      table.string("citizen_id", 13);
      table.string("name", 50);
      table.string("last_name", 50);
      table.string("gender", 10);
      table.string("email", 100);
      table.date("birth_date");
      table.string("phone", 10);
      table.string("address", 255);
      table.string("password");
      table.string("image_path", 255);
      table.enu("role", Object.values(userRole), {
        useNative: false,
        enumName: "role",
      });

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
