import Hash from "@ioc:Adonis/Core/Hash";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const phone = request.input("phone");
    const password = request.input("password");

    const user = await User.query()
      .where("phone", phone)
      .andWhere("status", 1)
      .firstOrFail();

    if (!(await Hash.verify(user.password, password))) {
      return response.unauthorized({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    const token = await auth.use("api").generate(user, {
      expiresIn: "7 days",
    });
    const payload = {
      user,
      token: token,
    };
    return response.ok(payload);
  }

  public async changePassword({ request, response }: HttpContextContract) {
    const citizen_id = request.input("citizen_id");
    const password = request.input("password");

    // Lookup user manually
    const user = await User.query().where("citizen_id", citizen_id).first();

    if (!user) {
      return response.unauthorized({ message: "ไม่เจอข้อมูลผู้ใช้" });
    }
    let newPassword = await Hash.make(password);

    await User.query()
      .where("citizen_id", citizen_id)
      .update({ password: newPassword });

    return response.ok({ id: user.id });
  }
}
