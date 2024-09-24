import axios from "axios";
import { IPlaceItem } from "../models/nearbySearch";
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";

const getNewPlace = async (placeID: string, placesList: string[]) => {
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";

  // Headers for the request
  const placeDetail_headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "location,primaryType",
  };

  const placeDetail_url = `https://places.googleapis.com/v1/places/${placeID}`;

  try {
    const placeDetail_response = await axios.get(placeDetail_url, {
      headers: placeDetail_headers,
    });
    const place_location = placeDetail_response.data.location;

    // Get nearby places
    const nearbySearch_headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.primaryType,places.shortFormattedAddress,places.photos",
    };

    const nearby_data = {
      includedTypes: [placeDetail_response.data.primaryType],
      maxResultCount: 5,
      locationRestriction: {
        circle: {
          center: {
            latitude: place_location.latitude,
            longitude: place_location.longitude,
          },
          radius: 3000,
        },
      },
    };

    // Headers for the request
    const nearby_headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.primaryType,places.shortFormattedAddress,places.photos",
    };

    // Construct the Google Maps Places API URL
    const nearby_url = "https://places.googleapis.com/v1/places:searchNearby";

    const nearbySearch_response = await axios.post(nearby_url, nearby_data, {
      headers: nearby_headers,
    });

    // Format JSON before keeping in cache
    const formattedResponse = await Promise.all(
      nearbySearch_response.data.places.map(async (item: IPlaceItem) => {
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

    const filteredResponse = formattedResponse.filter((item) => {
      return !placesList.includes(item.id);
    });

    return {
      status: "success",
      data: filteredResponse[0],
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
    };
  }
};

export default getNewPlace;
