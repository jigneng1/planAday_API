import { Elysia, t } from "elysia";
import axios from "axios";
import { getNearbySearch } from "./controllers/getNearbySearch";
import { createClient } from "redis";
import { getGeneratePlace } from "./controllers/getGeneratePlace";

// Connect to Redis
export const redisClient = createClient({
  url: "redis://localhost:6379",
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();
console.log("🚀 Connected to Redis");

const app = new Elysia()
  .get("/", () => "Welcome to Plan A Day web API")
  .get("/randomPlaces", ({ query: { id, places } }) => {
    if (id == undefined || places == undefined) {
      return {
        status: "error",
        message: "Please provide id and places",
      };
    }
    return getGeneratePlace(id, places);
  })
  .post(
    "/nearby-search",
    async ({ body }) => {
      const { lad, lng, category } = body;
      return getNearbySearch(lad, lng, category);
    },
    {
      body: t.Object({
        lad: t.String(),
        lng: t.String(),
        category: t.Array(t.String()),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦄 PlanAday API is running at ${app.server?.hostname}:${app.server?.port}`
);
