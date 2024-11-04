import getGenMorePlace from "../controllers/getGenMorePlace"; 
import { redisClient } from "..";

// Mock the redisClient
jest.mock("..", () => ({
  redisClient: {
    get: jest.fn(),
  },
}));

describe("getGenMorePlace", () => {
  const mockKey = "testKey";
  const mockPlaceList = ["place1", "place2"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a random place not in the provided placeList from cache", async () => {
    const mockCacheData = JSON.stringify([
      { id: "place1", name: "Place 1" },
      { id: "place2", name: "Place 2" },
      { id: "place3", name: "Place 3" },
    ]);

    // Mock the Redis get to return mock cache data
    (redisClient.get as jest.Mock).mockResolvedValueOnce(mockCacheData);

    const response = await getGenMorePlace(mockKey, mockPlaceList);

    expect(redisClient.get).toHaveBeenCalledWith(mockKey);
    expect(response).toEqual({
      status: "success",
      data: { id: "place3", name: "Place 3" }, // place1 and place2 are filtered out
    });
  });

  it("should return an error message if no data is found in cache", async () => {
    // Mock the Redis get to return null
    (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

    const response = await getGenMorePlace(mockKey, mockPlaceList);

    expect(redisClient.get).toHaveBeenCalledWith(mockKey);
    expect(response).toEqual({
      status: "error",
      message: "No data found in cache",
    });
  });
});
