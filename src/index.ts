import { Elysia, error, t } from "elysia";
import { getNearbySearch } from "./controllers/getNearbySearch";
import { createClient } from "redis";
import { getGeneratePlace } from "./controllers/getGeneratePlace";
import getPlaceDetailById from "./controllers/getPlaceDetailById";
import swagger from "@elysiajs/swagger";
import getTimeTravelByPlaceId from "./controllers/getTimeTravel";
import getNewPlace from "./controllers/getNewPlace";
import getGenMorePlace from "./controllers/getGenMorePlace";
import { Client } from "pg";
import register from "./controllers/auth/register";
import login from "./controllers/auth/login";
import jwt from "@elysiajs/jwt";

// Connect to Redis
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();
console.log("🚀 Connected to Redis");

// Connect to PostgreSQL
export const postgreClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

postgreClient
  .connect()
  .then(() => {
    console.log("🐘 Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL", err);
  });

const app = new Elysia()
  // Use Swagger
  .use(swagger())
  .use(
    jwt({
      secret: process.env.JWT_SECRET!,
      expiresIn: "1d",
    })
  )
  .get("/", () => "Welcome to Plan A Day web API")

  .post(
    "/login",
    ({ jwt, body }) => {
      const { username, password } = body;
      return login(username, password);
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/register",
    ({ body }) => {
      const { username, password } = body;
      return register(username, password);
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )

  // PLAN , PLACE ROUTE
  .get("/placeDetail/:id", ({ params: { id } }) => {
    return getPlaceDetailById(id);
  })
  .get("/randomPlaces", ({ query: { id, places } }) => {
    if (id == undefined || places == undefined) {
      return error(400, "Please provide id and places");
    }
    return getGeneratePlace(id, places);
  })
  .get("/timeTravel", ({ query: { origin, destination } }) => {
    if (origin == undefined || destination == undefined) {
      return error(400, "Please provide origin and destination");
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

  .post(
    "/getGenMorePlace",
    ({ body }) => {
      const { planId, placesList } = body;
      return getGenMorePlace(planId, placesList);
    },
    {
      body: t.Object({
        planId: t.String(),
        placesList: t.Array(t.String()),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦄 PlanAday API is running at ${app.server?.hostname}:${app.server?.port}`
);
