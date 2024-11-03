import axios from "axios";
import getNewPlace from "../controllers/getNewPlace"; 
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";
import { IPlaceItem } from "../models/nearbySearch";

jest.mock("axios");
jest.mock("../utils/getPhotoFromGoogle");

describe("getNewPlace", () => {
  const mockPlaceID = "place123";
  const mockPlacesList = ["place001", "place002"];
  const mockLocation = { latitude: 40.7128, longitude: -74.0060 };
  const mockPrimaryType = "restaurant";
  const mockNearbyPlaces: IPlaceItem[] = [
    {
        id: "place003",
        displayName: {
            text: "Mock Place 1",
            languageCode: ""
        },
        primaryType: "restaurant",
        shortFormattedAddress: "123 Test St",
        photos: [{ name: "photo1", height: 400, width: 600 }],
        regularOpeningHours: {
            openNow: false,
            periods: [
                {
                    open: { day: 1, hour: 9, minute: 0 },
                    close: { day: 1, hour: 17, minute: 0 },
                },
            ],
            weekdayDescriptions: ["Monday: 9 AM - 5 PM"],
        },
        primaryTypeDisplayName: {
            text: ""
        }
    },
    {
        id: "place004",
        displayName: {
            text: "Mock Place 2",
            languageCode: ""
        },
        primaryType: "restaurant",
        shortFormattedAddress: "456 Test Ave",
        photos: [{ name: "photo2", height: 400, width: 600 }],
        regularOpeningHours: {
            openNow: false,
            periods: [
                {
                    open: { day: 1, hour: 10, minute: 0 },
                    close: { day: 1, hour: 18, minute: 0 },
                },
            ],
            weekdayDescriptions: ["Monday: 10 AM - 6 PM"],
        },
        primaryTypeDisplayName: {
            text: ""
        }
    },
  ];  

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a new place suggestion", async () => {
    // Mock the place detail response
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        location: mockLocation,
        primaryType: mockPrimaryType,
      },
    });

    // Mock the nearby search response
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { places: mockNearbyPlaces },
    });

    // Mock getPhotoFromGoogle
    (getPhotoFromGoogle as jest.Mock)
      .mockResolvedValueOnce("http://example.com/photo1.jpg")
      .mockResolvedValueOnce("http://example.com/photo2.jpg");

    const result = await getNewPlace(mockPlaceID, mockPlacesList);

    expect(result.status).toBe("success");
    expect(result.data).toHaveProperty("id");
    expect(result.data).toHaveProperty("displayName");
    expect(result.data).toHaveProperty("primaryType");
    expect(result.data).toHaveProperty("shortFormattedAddress");
    expect(result.data).toHaveProperty("photosUrl");

    // Check if the returned place ID is not in the original places list
    expect(mockPlacesList.includes(result.data.id)).toBe(false);

    expect(axios.get).toHaveBeenCalledWith(
      `https://places.googleapis.com/v1/places/${mockPlaceID}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": expect.any(String),
          "X-Goog-FieldMask": "location,primaryType",
        },
      }
    );

    expect(axios.post).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        includedTypes: [mockPrimaryType],
        maxResultCount: 5,
        locationRestriction: {
          circle: {
            center: mockLocation,
            radius: 3000,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": expect.any(String),
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.shortFormattedAddress,places.photos",
        },
      }
    );

    expect(getPhotoFromGoogle).toHaveBeenCalledTimes(mockNearbyPlaces.length);
  });

  it("should handle errors and return an error message", async () => {
    const mockError = new Error("Request failed");

    (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await getNewPlace(mockPlaceID, mockPlacesList);

    expect(result.status).toBe("error");
    expect(result.message).toBe("Request failed");
  });
});
