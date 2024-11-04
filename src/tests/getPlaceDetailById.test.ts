import axios from "axios";
import getPlaceDetailById from "../controllers/getPlaceDetailById";
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";

// Mock the necessary modules
jest.mock("axios");
jest.mock("../utils/getPhotoFromGoogle");

describe("getPlaceDetailById", () => {
  const mockPlaceId = "testPlaceId";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return place details successfully", async () => {
    const mockResponse = {
      data: {
        id: mockPlaceId,
        displayName: { text: "Test Place" },
        primaryType: "restaurant",
        shortFormattedAddress: "123 Test St",
        accessibilityOptions: {},
        rating: 4.5,
        allowsDogs: true,
        liveMusic: false,
        parkingOptions: {},
        servesBeer: true,
        takeout: false,
        restroom: true,
        evChargeOptions: {},
        servesVegetarianFood: true,
        currentOpeningHours: { weekdayDescriptions: ["9 AM - 5 PM"] },
        nationalPhoneNumber: "123-456-7890",
        photos: [{ name: "photo_name" }],
        location: { lat: 123.45, lng: 678.9 },
      },
    };

    (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
    (getPhotoFromGoogle as jest.Mock).mockResolvedValueOnce(
      "http://example.com/photo.jpg"
    );

    const response = await getPlaceDetailById(mockPlaceId);

    expect(axios.get).toHaveBeenCalledWith(
      `https://places.googleapis.com/v1/places/${mockPlaceId}`,
      expect.anything()
    );
    expect(getPhotoFromGoogle).toHaveBeenCalledWith("photo_name");
    expect(response).toEqual({
      status: "success",
      data: {
        id: mockPlaceId,
        displayName: "Test Place",
        primaryType: "restaurant",
        shortFormattedAddress: "123 Test St",
        accessibilityOptions: {},
        rating: 4.5,
        allowsDogs: true,
        liveMusic: false,
        parkingOptions: {},
        servesBeer: true,
        takeout: false,
        restroom: true,
        evChargeOptions: {},
        servesVegetarianFood: true,
        currentOpeningHours: ["9 AM - 5 PM"], 
        nationalPhoneNumber: "123-456-7890",
        photo: "http://example.com/photo.jpg",
        location: { lat: 123.45, lng: 678.9 }, 
      },
    });
  });

  it("should return a warning if no photo is available", async () => {
    const mockResponse = {
      data: {
        id: mockPlaceId,
        displayName: { text: "Test Place" },
        photos: [],
      },
    };

    (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const response = await getPlaceDetailById(mockPlaceId);

    expect(axios.get).toHaveBeenCalledWith(
      `https://places.googleapis.com/v1/places/${mockPlaceId}`,
      expect.anything()
    );
    expect(getPhotoFromGoogle).not.toHaveBeenCalled();
    expect(response).toEqual({
      status: "success",
      data: {
        id: mockPlaceId,
        displayName: "Test Place",
        primaryType: undefined,
        shortFormattedAddress: undefined,
        accessibilityOptions: undefined,
        rating: undefined,
        allowsDogs: undefined,
        liveMusic: undefined,
        parkingOptions: undefined,
        servesBeer: undefined,
        takeout: undefined,
        restroom: undefined,
        evChargeOptions: undefined,
        servesVegetarianFood: undefined,
        currentOpeningHours: "",
        nationalPhoneNumber: undefined,
        photo: null,
      },
    });
  });

  it("should return an error if the API call fails", async () => {
    const errorMessage = "API error";

    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const response = await getPlaceDetailById(mockPlaceId);

    expect(response).toEqual({
      status: "error",
      message: expect.any(Error),
    });
  });
});
