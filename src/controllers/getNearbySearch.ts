import axios from "axios";

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
      "places.id,places.displayName,places.primaryType,places.shortFormattedAddress,places.currentOpeningHours",
  };

  // Construct the Google Maps Places API URL
  const url = "https://places.googleapis.com/v1/places:searchNearby";

  try {
    const response = await axios.post(url, data, { headers });
    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
    };
  }
};
