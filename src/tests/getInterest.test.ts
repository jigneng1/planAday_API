import getInterest from "../controllers/getInterest"
import userInterestModel from "../mongoose/userInterestModel";

jest.mock("../mongoose/userInterestModel");

describe("getInterest", () => {
  const mockUserId = "12345";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user interests successfully", async () => {
    const mockInterests = ["Travel", "Food"];
    (userInterestModel.findOne as jest.Mock).mockResolvedValueOnce({
      user_id: mockUserId,
      interests: mockInterests,
    });

    const result = await getInterest(mockUserId);

    expect(result).toEqual({
      status: "success",
      interest: mockInterests,
    });
    expect(userInterestModel.findOne).toHaveBeenCalledWith({ user_id: mockUserId });
  });

  it("should return an error if the user is not found", async () => {
    (userInterestModel.findOne as jest.Mock).mockResolvedValueOnce(null);

    const result = await getInterest(mockUserId);

    expect(result).toEqual({
      status: "error",
      message: "User not found",
    });
  });

  it("should handle errors during retrieval", async () => {
    const mockError = new Error("Database error");
    (userInterestModel.findOne as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await getInterest(mockUserId);

    expect(result).toEqual({
      status: "error",
      message: mockError,
    });
  });
});
