import { redisClient } from "..";

export const getGeneratePlace = async (key: string) => {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    return {
      status: "success",
      data: JSON.parse(cachedData),
    };
  } else {
    return {
      status: "error",
      message: "No data found in cache",
    };
  }
};
