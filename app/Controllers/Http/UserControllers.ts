import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class UserControllers {
  public async index({}: HttpContextContract) {
    return await User.query().where("status", 1);
  }

  public async create({ request }: HttpContextContract) {
    const image = request.file("image");
    let body = request.body();
    if (image) {
      let name = `${new Date().valueOf()}${image.clientName}`;
      await image.move(Application.tmpPath("uploads"), {
        name: name,
      });
      body.image_path = `uploads/${name}`;
    }

    await User.create(request.body());

    return { status: 200, message: "success" };
  }

  public async show({ request }: HttpContextContract) {
    return await User.findOrFail(request.param("id"));
  }

  public async edit({ request }: HttpContextContract) {
    await User.findOrFail(request.param("id"));
    const image = request.file("image");
    let body = request.body();
    if (image) {
      let name = `${new Date().valueOf()}${image.clientName}`;
      await image.move(Application.tmpPath("uploads"), {
        name: name,
      });
      body.image_path = `uploads/${name}`;
    }
    await User.query().where("id", request.param("id")).update(request.body());
    return { status: 200, message: "success" };
  }

  public async destroy({ request }: HttpContextContract) {
    await User.findOrFail(request.param("id"));
    await User.query().where("id", request.param("id")).update({ status: 0 });

    return { status: 200, message: "success" };
  }
}
