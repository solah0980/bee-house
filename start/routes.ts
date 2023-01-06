/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/", () => {
  return {
    message: "Welcome",
  };
});

Route.group(() => {
  Route.group(() => {
    Route.post("", "UserControllers.create");
    Route.get("", "UserControllers.index").middleware("auth");
    Route.get(":id", "UserControllers.show").middleware("auth");
    Route.put(":id", "UserControllers.edit").middleware("auth");
    Route.delete(":id", "UserControllers.destroy").middleware("auth");
  }).prefix("/user");

  Route.group(() => {
    Route.post("login", "AuthController.login");
    Route.post("change-pass", "AuthController.changePassword");
  }).prefix("/auth");

  Route.group(() => {
    Route.post("/", "BeeHousesController.create");
    Route.get("/:user_id", "BeeHousesController.show");
    Route.get("/", "BeeHousesController.index");
    Route.delete("/:id", "BeeHousesController.destroy");

    Route.post("/build", "BeeHousesController.buildNest");
    Route.get("/build/:bee_house_id", "BeeHousesController.showBuildKeepNest");

    Route.post("/keep", "BeeHousesController.keepNest");

    Route.get("/show-nest/:user_id", "BeeHousesController.showNestByUserId");
  })
    .prefix("/bee-house")
    .middleware("auth");

  Route.group(() => {
    Route.post("/user/:id", "DashboardsController.dashboardUser");
    Route.post("/admin", "DashboardsController.dashboardAdmin");
  })
    .prefix("/dashboard")
    .middleware("auth");
}).prefix("/api");
