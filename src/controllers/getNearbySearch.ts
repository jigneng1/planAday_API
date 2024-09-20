import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "..";
import { IPlaceItem } from "../models/nearbySearch";
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";

export const getNearbySearch = async (
  lad: string,
  lng: string,
  category: string[]
) => {
  // Your Google Maps API Key
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";

  const data = {
    includedTypes: category,
    maxResultCount: 20,
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
      "places.id,places.displayName,places.primaryType,places.shortFormattedAddress,places.photos",
  };

  // Construct the Google Maps Places API URL
  const url = "https://places.googleapis.com/v1/places:searchNearby";

  try {
    const response = await axios.post(url, data, {
      headers,
    });

    // Format JSON before keeping in cache
    const formattedResponse = await Promise.all(
      response.data.places.map(async (item: IPlaceItem) => {
        const photoUrl = await getPhotoFromGoogle(item.photos[0].name);
        return {
          id: item.id,
          displayName: item.displayName.text,
          primaryType: item.primaryType,
          shortFormattedAddress: item.shortFormattedAddress,
          photosUrl: photoUrl,
        };
      })
    );

    // store in cache for 24 hours
    const cacheKey = uuidv4(); // cache key
    await redisClient.setEx(cacheKey, 86400, JSON.stringify(formattedResponse));
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
