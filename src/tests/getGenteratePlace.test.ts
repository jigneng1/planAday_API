import { getGeneratePlace } from "../controllers/getGeneratePlace";
import { redisClient } from "..";

// Mock redisClient.get
jest.mock("..", () => ({
  redisClient: {
    get: jest.fn(),
  },
}));

describe("getGeneratePlace", () => {
  it("should return random places and success status if data is in cache", async () => {
    const cacheKey = "test-cache-key";
    const placeId = "test-place-id";
    const mockData = JSON.stringify([
      { primaryType: "park", name: "Central Park" },
      { primaryType: "cafe", name: "Arty Cafe" },
      { primaryType: "park", name: "Green Park" },
      { primaryType: "gym", name: "Susu Gym" },
      { primaryType: "resturant", name: "Nami Foods&Drinks" },
    ]);

    (redisClient.get as jest.Mock).mockResolvedValue(mockData);

    const result = await getGeneratePlace(cacheKey, placeId);

    expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
    expect(result.status).toBe("success");
    expect(result.data.length).toBeGreaterThan(0); 
    expect(result.data[0]).toHaveProperty("name");
  });

  it("should return an error status if no data is in cache", async () => {
    const cacheKey = "test-cache-key";
    const placeId = "test-place-id";

    (redisClient.get as jest.Mock).mockResolvedValue(null);

    const result = await getGeneratePlace(cacheKey, placeId);

    expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
    expect(result.status).toBe("error");
    expect(result.message).toBe("No data found in cache");
  });
});
