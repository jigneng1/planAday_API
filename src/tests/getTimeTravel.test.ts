import getTimeTravel from "../controllers/getTimeTravel"; // adjust the path
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getTimeTravel", () => {
  const mockOrigin = "ChIJd8BlQ2BZwokRAFUEcm_qrcA";
  const mockDestination = "ChIJD7fiBh9u5kcRYJSMaMOCCwQ";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return travel times for driving and walking modes when API response is successful", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          rows: [
            {
              elements: [
                {
                  status: "OK",
                  duration: { text: "10 mins" },
                },
              ],
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          rows: [
            {
              elements: [
                {
                  status: "OK",
                  duration: { text: "30 mins" },
                },
              ],
            },
          ],
        },
      });

    const result = await getTimeTravel(mockOrigin, mockDestination);

    expect(result).toEqual({
      driving: "10 mins",
      walking: "30 mins",
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("mode=driving")
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("mode=walking")
    );
  });

  it("should handle errors and return null for failed modes", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          rows: [
            {
              elements: [
                {
                  status: "NOT_FOUND",
                },
              ],
            },
          ],
        },
      })
      .mockRejectedValueOnce(new Error("Network error"));

    const result = await getTimeTravel(mockOrigin, mockDestination);

    expect(result).toEqual({
      driving: null,
      walking: null,
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});
