import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import { beeHouseStatus } from "App/Models/BeeHouse";
import _ from "lodash";

export default class DashboardsController {
  private async calculateSummaryAll(payload) {
    const usersTotal = await Database.from("users")
      .where("status", 1)
      .count("id as total");

    const buildsTotal = await Database.from("bee_houses")
      .where("status", 1)
      .count("id as total");
    payload.user_total = usersTotal[0] ? usersTotal[0].total : 0;
    payload.houses_total = buildsTotal[0] ? buildsTotal[0].total : 0;

    return payload;
  }

  private async calculateSummaryUserSelf(request) {
    let data = {
      empty_total: 0,
      my_house_total: 0,
      build_total: 0,
      keep_total: 0,
      build_months: [],
      keep_months: [],
      user_total: 0,
    };
    const emptyCount = await Database.from("bee_houses")
      .where("user_id", request.param("id"))
      .where("status", 1)
      .andWhere("house_status", beeHouseStatus.Empty)
      .count("* as total");
    const myHouseCount = await Database.from("bee_houses")
      .where("user_id", request.param("id"))
      .where("status", 1)
      .count("* as total");

    data.empty_total = emptyCount[0] ? emptyCount[0].total : 0;
    data.my_house_total = myHouseCount[0] ? myHouseCount[0].total : 0;

    let date = new Date();
    let endYear = new Date(date.getFullYear(), 12, 0);

    let cond1 = "";
    let cond2 = "";
    if (request.input("date")) {
      cond1 = `and builds.date = '${request.input("date")}'`;
      cond2 = `and keeps.date = '${request.input("date")}'`;
    } else {
      cond1 = `and builds.date BETWEEN '${`${date.getFullYear()}-01-01`}' AND '${`${endYear.getFullYear()}-12-${endYear.getDate()}'`}`;
      cond2 = `and keeps.date BETWEEN '${`${date.getFullYear()}-01-01`}' AND '${`${endYear.getFullYear()}-12-${endYear.getDate()}'`}`;
    }
    let buildsMonthTotal = await Database.rawQuery(`
select date_format(builds.date, "%M") as date, count(builds.id) as total 
from builds   
join bee_houses as bh on bh.id = builds.bee_houses_id
where bh.user_id = ${request.param("id")}
${cond1}
group by month(builds.date)
order by date_format(builds.date, 'asc')
      `);

    let keepMonthTotal = await Database.rawQuery(`
select date_format(keeps.date, "%M") as date, count(keeps.id) as total 
from keeps   
join builds as b on b.id = keeps.build_id
join bee_houses as bh on bh.id = b.bee_houses_id
where bh.user_id = ${request.param("id")}
${cond2}
group by month(keeps.date)
order by date_format(keeps.date, 'asc')
      `);

    data.build_months = buildsMonthTotal[0] ? buildsMonthTotal[0] : null;
    data.keep_months = keepMonthTotal[0] ? keepMonthTotal[0] : null;

    for (let b of buildsMonthTotal[0]) {
      data.build_total += b.total;
    }

    for (let k of keepMonthTotal[0]) {
      data.keep_total += k.total;
    }

    return data;
  }

  public async dashboardUser({ request }: HttpContextContract) {
    let payload = await this.calculateSummaryUserSelf(request);

    payload = await this.calculateSummaryAll(payload);

    return payload;
  }

  private async calculateSummaryAdmin(request) {
    let data = {
      empty_total: 0,
      build_total: 0,
      keep_total: 0,
      build_months: [],
      keep_months: [],
      house_months: [],
    };
    const emptyCount = await Database.from("bee_houses")
      .where("status", 1)
      .andWhere("house_status", beeHouseStatus.Empty)
      .count("* as total");

    data.empty_total = emptyCount[0] ? emptyCount[0].total : 0;

    let date = new Date();
    let endYear = new Date(date.getFullYear(), 12, 0);

    let start_date = `${date.getFullYear()}-01-01`;
    let end_date = `${endYear.getFullYear()}-12-${endYear.getDate()}`;

    if (request.input("start_date") || request.input("end_date")) {
      start_date = request.input("start_date");
      end_date = request.input("end_date");
    }
    let buildsMonthTotal = await Database.rawQuery(`
select date_format(builds.date, "%M") as date, count(builds.id) as total 
from builds   
join bee_houses as bh on bh.id = builds.bee_houses_id
and builds.date BETWEEN '${`${start_date}' AND '${end_date}'`}
group by month(builds.date)
order by date_format(builds.date, 'asc')
      `);

    let keepMonthTotal = await Database.rawQuery(`
select date_format(keeps.date, "%M") as date, count(keeps.id) as total 
from keeps   
join builds as b on b.id = keeps.build_id
join bee_houses as bh on bh.id = b.bee_houses_id
and keeps.date BETWEEN '${`${start_date}' AND '${end_date}'`}
group by month(keeps.date)
order by date_format(keeps.date, 'asc')
      `);

    let houseMonthTotal = await Database.rawQuery(`
select date_format(date, "%M") as date, count(id) as total 
from bee_houses  
where date BETWEEN '${start_date}' AND '${end_date}'
group by month(date)
order by date_format(date, 'asc')`);

    data.house_months = houseMonthTotal[0] ? houseMonthTotal[0] : null;
    data.build_months = buildsMonthTotal[0] ? buildsMonthTotal[0] : null;
    data.keep_months = keepMonthTotal[0] ? keepMonthTotal[0] : null;

    for (let b of buildsMonthTotal[0]) {
      data.build_total += b.total;
    }

    for (let k of keepMonthTotal[0]) {
      data.keep_total += k.total;
    }

    return data;
  }

  public async dashboardAdmin({ request }: HttpContextContract) {
    let payload = await this.calculateSummaryAdmin(request);

    payload = await this.calculateSummaryAll(payload);

    return payload;
  }
}
