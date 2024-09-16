import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "..";

export const getNearbySearch = async (
  lad: string,
  lng: string,
  category: string[]
) => {
  // Your Google Maps API Key
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";

  const data = {
    includedTypes: category,
    maxResultCount: 10,
    locationRestriction: {
      circle: {
        center: {
          latitude: lad,
          longitude: lng,
        },
        radius: 3000,
      },
    },
  };

  // Headers for the request
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask":
      "places.id,places.displayName,places.primaryType,places.shortFormattedAddress",
  };

  // Construct the Google Maps Places API URL
  const url = "https://places.googleapis.com/v1/places:searchNearby";

  try {
    const response = await axios.post(url, data, { headers });

    // store in cache for 24 hours
    const cacheKey = uuidv4(); // cache key
    await redisClient.setEx(cacheKey, 86400, JSON.stringify(response.data));
    return {
      status: "success",
      id: cacheKey,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error,
    };
  }
};
