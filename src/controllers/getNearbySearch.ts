import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "..";
import { IPlaceItem } from "../models/nearbySearch";
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";
import { isPlaceOpenAtTime } from "../utils/isPlaceAvailable";

export const getNearbySearch = async (
  lad: string,
  lng: string,
  category: string[],
  day: number,
  hour: number,
  minute: number
) => {
  // Your Google Maps API Key
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";

  // Headers for the request
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask":
      "places.id,places.displayName,places.primaryType,places.shortFormattedAddress,places.regularOpeningHours,places.photos",
  };

  // Construct the Google Maps Places API URL
  const url = "https://places.googleapis.com/v1/places:searchNearby";

  async function getNearbySearch(lad: string, lng: string, category: string) {
    // Your Google Maps API Key
    const response = await axios.post(
      url,
      {
        includedTypes: [category],
        //rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: {
              latitude: lad,
              longitude: lng,
            },
            radius: 3000,
          },
        },
      },
      {
        headers,
      }
    );
    return response;
  }
  try {
    // Fetch the data from Google Maps Places API
    const placePool: any = [];

    for (const cat of category) {
      const response = await getNearbySearch(lad, lng, cat);
      placePool.push(...response.data.places);
    }

    const availablePlace = placePool.filter((place: IPlaceItem) => {
      if (!place.regularOpeningHours) {
        return true;
      } else {
        return isPlaceOpenAtTime(
          place.regularOpeningHours.periods,
          day,
          hour,
          minute
        );
      }
    });

    // Handle no places available
    if (availablePlace.length === 0) {
      return {
        status: "error",
        message: "No places available at the given time",
      };
    }

    // Format JSON before keeping in cache
    const formattedResponse = await Promise.all(
      availablePlace.map(async (item: IPlaceItem) => {
        let photoUrl = null;
        if (
          item.photos &&
          Array.isArray(item.photos) &&
          item.photos.length > 0
        ) {
          try {
            // Fetch the photo URL
            photoUrl = await getPhotoFromGoogle(item.photos[0].name);
          } catch (error) {
            console.error("Error fetching photo:", error);
          }
        } else {
          console.warn(
            `No photo available for place: ${item.displayName.text}`
          );
        }
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
      placeAvailable: formattedResponse.length,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error || "something went wrong",
    };
  }
};
