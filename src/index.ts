import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Welcome to Plan A Day web API")
  .listen(3000);

console.log(
  `🦊 WebAPI is running at ${app.server?.hostname}:${app.server?.port}`
);
