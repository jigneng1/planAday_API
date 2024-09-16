import { redisClient } from "..";

export const getGeneratePlace = async (id: string, places: string) => {
  const cachedData = await redisClient.get(id);
  if (cachedData) {
    const result = JSON.parse(cachedData);
    const randomPlaces = result.places
      .sort(() => Math.random() - 0.5)
      .slice(0, places);
    return {
      status: "success",
      data: randomPlaces,
    };
  } else {
    return {
      status: "error",
      message: "No data found in cache",
    };
  }
};
