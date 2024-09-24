import { Elysia, t } from "elysia";
import { getNearbySearch } from "./controllers/getNearbySearch";
import { createClient } from "redis";
import { getGeneratePlace } from "./controllers/getGeneratePlace";
import getPlaceDetailById from "./controllers/getPlaceDetailById";
import swagger from "@elysiajs/swagger";
import getTimeTravelByPlaceId from "./controllers/getTimeTravel";
import getNewPlace from "./controllers/getNewPlace";

// Connect to Redis
export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();
console.log("🚀 Connected to Redis");

const app = new Elysia()
  // Use Swagger
  .use(swagger())
  .get("/", () => "Welcome to Plan A Day web API")
  .get("/placeDetail/:id", ({ params: { id } }) => {
    if (id == undefined) {
      return {
        status: "error",
        message: "Please provide id",
      };
    }
    return getPlaceDetailById(id);
  })
  .get("/randomPlaces", ({ query: { id, places } }) => {
    if (id == undefined || places == undefined) {
      return {
        status: "error",
        message: "Please provide id and places",
      };
    }
    return getGeneratePlace(id, places);
  })
  .get("/timeTravel", ({ query: { origin, destination } }) => {
    if (origin == undefined || destination == undefined) {
      return {
        status: "error",
        message: "Please provide origin and destination",
      };
    }
    return getTimeTravelByPlaceId(origin, destination);
  })
  .post(
    "/nearby-search",
    ({ body }) => {
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
  .post(
    "/getNewPlace",
    ({ body }) => {
      const { placeReplaceId, placesList } = body;
      return getNewPlace(placeReplaceId, placesList);
    },
    {
      body: t.Object({
        placeReplaceId: t.String(),
        placesList: t.Array(t.String()),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦄 PlanAday API is running at ${app.server?.hostname}:${app.server?.port}`
);
