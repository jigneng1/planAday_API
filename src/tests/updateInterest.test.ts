import updateInterest from "../controllers/updateInterest"
import userInterestModel from "../mongoose/userInterestModel";

jest.mock("../mongoose/userInterestModel");

describe("updateInterest", () => {
  const mockUserId = "testInterest";
  const mockInterests = ["Gym", "Museum"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update user interests successfully", async () => {
    const mockUserInterest = {
      user_id: mockUserId,
      interests: [],
      save: jest.fn().mockResolvedValueOnce(undefined),
    };
    
    (userInterestModel.findOne as jest.Mock).mockResolvedValueOnce(mockUserInterest);

    const result = await updateInterest(mockUserId, mockInterests);

    expect(result).toEqual({
      status: "success",
      message: "Interest updated",
    });
    expect(userInterestModel.findOne).toHaveBeenCalledWith({ user_id: mockUserId });
    expect(mockUserInterest.interests).toEqual(mockInterests);
    expect(mockUserInterest.save).toHaveBeenCalled();
  });

  it("should return an error if the user is not found", async () => {
    (userInterestModel.findOne as jest.Mock).mockResolvedValueOnce(null);

    const result = await updateInterest(mockUserId, mockInterests);

    expect(result).toEqual({
      status: "error",
      message: "User not found",
    });
  });

  it("should handle errors during updating", async () => {
    const mockError = new Error("Database error");
    const mockUserInterest = {
      user_id: mockUserId,
      interests: [],
      save: jest.fn().mockRejectedValueOnce(mockError),
    };
    
    (userInterestModel.findOne as jest.Mock).mockResolvedValueOnce(mockUserInterest);

    const result = await updateInterest(mockUserId, mockInterests);

    expect(result).toEqual({
      status: "error",
      message: mockError,
    });
  });
});
