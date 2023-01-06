import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import BeeHouse, { beeHouseStatus } from "App/Models/BeeHouse";
import Build from "App/Models/Build";
import Keep from "App/Models/Keep";
import User from "App/Models/User";
import _ from "lodash";

export default class BeeHousesController {
  public async index({}: HttpContextContract) {
    const users = await User.query()
      .where("status", 1)
      .preload("bee_houses", (query) => {
        query.preload("builds", (query) => {
          query.preload("keep").orderBy("createdAt", "desc");
        });
      });

    let payload: any = [];

    for (let user of users) {
      let bee_houses = user.bee_houses;
      let data = {
        ..._.pick(user.$original, ["id", "name", "lastName"]),
        empty_total: 0,
        house_total: 0,
        build_total: 0,
        keep_total: 0,
      };

      for (let house of bee_houses) {
        if (house.status) {
          data.house_total += 1;
        }
        if (house.builds.length === 0) {
          if (house.status) {
            data.empty_total += 1;
          }
        }
        for (let build of house.builds) {
          data.build_total += 1;
          if (build.keep) {
            data.keep_total += 1;
            if (house.status) {
              data.empty_total += 1;
            }
          }
        }
      }
      payload.push(data);
    }
    return payload;
  }

  public async create({ request }: HttpContextContract) {
    let body = request.body();
    await User.findOrFail(body.user_id);

    let countTotal = await BeeHouse.query().where("user_id", body.user_id);
    for (let i = 1; i <= body.quantity; i++) {
      await BeeHouse.create({
        user_id: body.user_id,
        tag: countTotal.length + i,
        house_status: beeHouseStatus.Empty,
        date: new Date(),
      });
    }

    return { status: 200, message: "success" };
  }

  public async show({ request }: HttpContextContract) {
    let houses = await BeeHouse.query()
      .where("user_id", request.param("user_id"))
      .andWhere("status", 1)
      .preload("builds", (query) => {
        query.preload("keep").orderBy("createdAt", "desc");
      });

    let payload: any = [];

    for (let house of houses) {
      let builds = house.builds;
      let data = {
        ...house.$original,
        build_total: 0,
        keep_total: 0,
      };
      for (let build of builds) {
        data.build_total += 1;
        if (build.keep) {
          data.keep_total += 1;
        }
      }
      payload.push(data);
    }

    return payload;
  }

  public async destroy({ request }: HttpContextContract) {
    await BeeHouse.findOrFail(request.param("id"));
    await BeeHouse.query()
      .where("id", request.param("id"))
      .update({ status: 0 });

    return { status: 200, message: "success" };
  }

  public async buildNest({ request }: HttpContextContract) {
    await Build.create({
      bee_houses_id: request.input("bee_house_id"),
      date: new Date(),
    });
    await BeeHouse.query()
      .where("id", request.input("bee_house_id"))
      .update({ house_status: beeHouseStatus.Build });
    return { status: 200, message: "success" };
  }

  public async keepNest({ request }: HttpContextContract) {
    let build = await Build.findByOrFail("id", request.input("build_id"));
    await Keep.create({
      build_id: request.input("build_id"),
      date: new Date(),
    });
    await BeeHouse.query()
      .where("id", build.bee_houses_id)
      .update({ house_status: beeHouseStatus.Empty });
    return { status: 200, message: "success" };
  }

  public async showBuildKeepNest({ request }: HttpContextContract) {
    const houses_id = request.param("bee_house_id");
    const builds = await Build.query()
      .where("bee_houses_id", houses_id)
      .preload("keep");
    return builds;
  }

  public async showNestByUserId({ request }: HttpContextContract) {
    let date = this.DateNow();

    const user_id = request.param("user_id");
    const houses = await BeeHouse.query()
      .where("user_id", user_id)
      .andWhere("status", 1)
      .orderBy("tag", "asc")
      .preload("builds", (postsQuery) => {
        postsQuery.where("date", date);
      });

    let payload: any = [];
    for (let house of houses) {
      let build = house.builds;
      let data: any = {
        ...house.$original,
        canBuild: true,
        canKeep: false,
        status: "ว่าง",
        build_id: null,
      };
      if (build.length > 0) {
        data.status = "สร้างรัง";
        data.canBuild = false;
        data.canKeep = false;
      } else {
        let build_check = await Build.query()
          .where("bee_houses_id", house.id)
          .preload("keep")
          .orderBy("date", "desc")
          .first();
        if (build_check) {
          data.status = "สร้างรัง";
          data.canBuild = false;
          data.canKeep = true;
          data.build_id = build_check.id;
          if (build_check.keep) {
            if (this.DateNow(build_check.keep.date) === date) {
              data.status = "เก็บเกี่ยว";
              data.canBuild = false;
              data.canKeep = false;
            } else {
              data.status = "ว่าง";
              data.canBuild = true;
              data.canKeep = false;
            }
          }
        }
      }

      payload.push(data);
    }
    return payload;
  }

  private DateNow(date = new Date()) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
}
