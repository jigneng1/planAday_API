import axios from "axios";
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";

const getPlaceDetailById = async (id: string) => {
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";

  // Headers for the request
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask":
      "id,displayName,primaryType,shortFormattedAddress,accessibilityOptions,rating,allowsDogs,liveMusic,parkingOptions,servesBeer,takeout,restroom,evChargeOptions,servesVegetarianFood,currentOpeningHours,nationalPhoneNumber,photos",
  };

  const url = `https://places.googleapis.com/v1/places/${id}`;

  try {
    const response = await axios.get(url, {
      headers,
    });

    const photoName = response.data.photos[0].name;
    const photoUrl = await getPhotoFromGoogle(photoName);
    // Format response before returning
    const filteredResponse = {
      id: response.data.id,
      displayName: response.data.displayName.text,
      primaryType: response.data.primaryType,
      shortFormattedAddress: response.data.shortFormattedAddress,
      accessibilityOptions: response.data.accessibilityOptions,
      rating: response.data.rating,
      allowsDogs: response.data.allowsDogs,
      liveMusic: response.data.liveMusic,
      parkingOptions: response.data.parkingOptions,
      servesBeer: response.data.servesBeer,
      takeout: response.data.takeout,
      restroom: response.data.restroom,
      evChargeOptions: response.data.evChargeOptions,
      servesVegetarianFood: response.data.servesVegetarianFood,
      currentOpeningHours:
        response.data.currentOpeningHours.weekdayDescriptions,
      nationalPhoneNumber: response.data.nationalPhoneNumber,
      photo: photoUrl,
    };
    return {
      status: "success",
      data: filteredResponse,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default getPlaceDetailById;
