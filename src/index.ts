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
import { bearer } from "@elysiajs/bearer";
import mongoose from "mongoose";
import createGeneratePlan from "./controllers/createGeneratePlan";
import createpublicPlan from "./controllers/createpublicPlan";
import getSuggestPlan from "./controllers/getsuggestPlan";
import getPlanDetailById from "./controllers/getPlanDetailById";
import getUserDetail from "./controllers/getUserDetail";
import getPlanHistory from "./controllers/getPlanHistory";
import deletePlan from "./controllers/deletePlan";

// check ENV
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}
if (!process.env.REDIS_URL) {
  console.error("REDIS_URL is required");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

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

await postgreClient
  .connect()
  .then(() => console.log("🐘 Connected to PostgreSQL"))
  .catch((err) => {
    console.error("Error connecting to PostgreSQL", err);
    process.exit(1);
  });

// Connect to MongoDB
await mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("🍃 Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });

const app = new Elysia();
// Use Swagger
app
  .use(swagger())
  .use(
    jwt({
      secret: process.env.JWT_SECRET!,
      exp: "1d",
    })
  )
  .use(bearer())
  .derive(async ({ jwt, bearer }) => {
    const checkAuth = await jwt.verify(bearer);
    console.log("checkAuth", checkAuth);
    return {
      checkAuth,
    };
  })

  .get("/", () => "Welcome to Plan A Day web API")
  .post(
    "/login",
    async ({ jwt, body }) => {
      const { username, password } = body;
      const getUserId = await login(username, password);
      if (getUserId.status === "error") {
        return error(400, getUserId);
      }
      const getToken = await jwt.sign({ userId: getUserId });
      return {
        status: "success",
        message: "Login success",
        token: getToken,
      };
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
  // Middleware ALL Routes
  .guard(
    {
      beforeHandle: ({ checkAuth }) => {
        if (!checkAuth) {
          return error(401, "Unauthorized");
        }
      },
    },
    (app) =>
      app
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
            const { lad, lng, category, startDay, startHour, startMinute } =
              body;
            return getNearbySearch(
              lad,
              lng,
              category,
              startDay,
              startHour,
              startMinute
            );
          },
          {
            body: t.Object({
              lad: t.String(),
              lng: t.String(),
              category: t.Array(t.String()),
              startDay: t.Number(),
              startHour: t.Number(),
              startMinute: t.Number(),
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
        .post(
          "/createPlan",
          ({ body, checkAuth }) => {
            const data = body;
            if (!checkAuth) {
              return error(401, "Unauthorized");
            }
            const { userId } = checkAuth;
            return createGeneratePlan(data, userId.toString());
          },
          {
            body: t.Object({
              planName: t.String(),
              startTime: t.String(),
              startDate: t.String(),
              category: t.Array(t.String()),
              numberOfPlaces: t.Number(),
              planID: t.String(),
              selectedPlaces: t.Array(
                t.Object({
                  id: t.String(),
                  displayName: t.String(),
                  primaryType: t.String(),
                  shortFormattedAddress: t.String(),
                  photosUrl: t.String(),
                })
              ),
            }),
          }
        )

        .post(
          "/createpublicPlan",
          ({ body }) => {
            const { planId } = body;
            return createpublicPlan(planId);
          },
          {
            body: t.Object({
              planId: t.String(),
            }),
          }
        )

        .get("/suggestPlan", ({ checkAuth }) => {
          if (!checkAuth) {
            return error(401, "Unauthorized");
          }
          const { userId } = checkAuth;
          return getSuggestPlan(userId.toString());
        })

        .get("/getPlanDetailByid/:plan_id", ({ params: { plan_id } }) => {
          return getPlanDetailById(plan_id);
        })
        .get("/userDetail", ({ checkAuth }) => {
          if (!checkAuth) {
            return error(401, "Unauthorized");
          }
          const { userId } = checkAuth;
          return getUserDetail(userId.toString());
        })
        .get("/getPlanHistory", ({ checkAuth }) => {
          if (!checkAuth) {
            return error(401, "Unauthorized");
          }
          const { userId } = checkAuth;
          return getPlanHistory(userId.toString());
        })
        .delete("/deletePlan/:plan_id", ({ params: { plan_id } }) => {
          return deletePlan(plan_id);
        })
  )
  .listen(3000, () => {
    console.log(
      `🦄 PlanAday API is running at ${app.server?.hostname}:${app.server?.port}`
    );
  });
