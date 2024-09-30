import { redisClient } from "..";
// ส่ง id [String] แล้วสุ่มจาก cache แล้วส่งกลับไป ให้ไม่ซ้ำกัน
const getGenMorePlace = async (key: string, placeList: string[]) => {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    const resultCache = JSON.parse(cachedData);
    const result = resultCache.filter((item: any) => {
      return !placeList.includes(item.id);
    });
    return {
      status: "success",
      data: result[0],
    };
  } else {
    return {
      status: "error",
      message: "No data found in cache",
    };
  }
};

export default getGenMorePlace;
