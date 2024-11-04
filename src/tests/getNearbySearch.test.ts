import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "..";
import getPhotoFromGoogle from "../utils/getPhotoFromGoogle";
import { getNearbySearch } from "../controllers/getNearbySearch";
import { isPlaceOpenAtTime } from "../utils/isPlaceAvailable";

// Mock external dependencies
jest.mock("axios");
jest.mock("uuid", () => ({ v4: jest.fn(() => "test-cache-key") }));
jest.mock("..", () => ({
  redisClient: {
    setEx: jest.fn(),
  },
}));
jest.mock("../utils/getPhotoFromGoogle");
jest.mock("../utils/isPlaceAvailable");

describe("getNearbySearch", () => {
  const mockLad = "40.7128";
  const mockLng = "-74.0060";
  const mockCategories = ["restaurant", "cafe"];
  const mockDay = 1;
  const mockHour = 10;
  const mockMinute = 30;

  const mockPlacesData = [
    {
      id: "place001",
      displayName: { text: "Test Place 1" },
      primaryType: ["restaurant","Museum"],
      shortFormattedAddress: "123 Test St",
      regularOpeningHours: {
        periods: [
          {
            open: { day: 1, hour: 9, minute: 0 },
            close: { day: 1, hour: 21, minute: 0 },
          },
        ],
      },
      photos: [{ name: "photo1" }],
    },
    {
      id: "place002",
      displayName: { text: "Test Place 2" },
      primaryType: "cafe",
      shortFormattedAddress: "456 Test Ave",
      photos: [{ name: "photo2" }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return available places and store the response in Redis cache", async () => {
    // Mock axios responses
    (axios.post as jest.Mock)
      .mockResolvedValueOnce({ data: { places: [mockPlacesData[0]] } })
      .mockResolvedValueOnce({ data: { places: [mockPlacesData[1]] } });

    // Mock availability and photo retrieval functions
    (isPlaceOpenAtTime as jest.Mock).mockReturnValue(true);
    (getPhotoFromGoogle as jest.Mock)
      .mockResolvedValueOnce("http://example.com/photo1.jpg")
      .mockResolvedValueOnce("http://example.com/photo2.jpg");

    const result = await getNearbySearch(
      mockLad,
      mockLng,
      mockCategories,
      mockDay,
      mockHour,
      mockMinute
    );

    expect(result.status).toBe("success");
    expect(result.id).toBe("test-cache-key");
    expect(result.placeAvailable).toBe(2);

    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(isPlaceOpenAtTime).toHaveBeenCalled();
    expect(getPhotoFromGoogle).toHaveBeenCalledTimes(2);
    expect(redisClient.setEx).toHaveBeenCalledWith(
      "test-cache-key",
      86400,
      JSON.stringify([
        {
          id: "place001",
          displayName: "Test Place 1",
          primaryType: ["restaurant","Museum"],
          shortFormattedAddress: "123 Test St",
          photosUrl: "http://example.com/photo1.jpg",
        },
        {
          id: "place002",
          displayName: "Test Place 2",
          primaryType: "cafe",
          shortFormattedAddress: "456 Test Ave",
          photosUrl: "http://example.com/photo2.jpg",
        },
      ])
    );
  });

  it("should handle when no places are available at the given time", async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { places: [] } });

    const result = await getNearbySearch(
      mockLad,
      mockLng,
      mockCategories,
      mockDay,
      mockHour,
      mockMinute
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe("No places available at the given time");
    expect(redisClient.setEx).not.toHaveBeenCalled();
  });

  it("should handle errors and return an error message", async () => {
    const mockError = new Error("Request failed");
    (axios.post as jest.Mock).mockRejectedValue(mockError);

    const result = await getNearbySearch(
      mockLad,
      mockLng,
      mockCategories,
      mockDay,
      mockHour,
      mockMinute
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(mockError.message); 
    expect(redisClient.setEx).not.toHaveBeenCalled();
  });
});
