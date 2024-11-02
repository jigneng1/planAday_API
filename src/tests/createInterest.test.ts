import createInterest from "../controllers/createInterest"; 
import userInterestModel from "../mongoose/userInterestModel";

jest.mock("../mongoose/userInterestModel");

describe("createInterest", () => {
  const mockUserId = "testInterest";
  const mockInterests = ["Restaurant", "Art_gallery","Park"];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an interest successfully", async () => {
    (userInterestModel.prototype.save as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await createInterest(mockUserId, mockInterests);

    expect(result).toEqual({
      status: "success",
      message: "Interest created",
    });
    expect(userInterestModel).toHaveBeenCalledWith({
      user_id: mockUserId,
      interests: mockInterests,
    });
    expect(userInterestModel.prototype.save).toHaveBeenCalled();
  });

  it("should handle errors when creating interest", async () => {
    const mockError = new Error("Database error");
    (userInterestModel.prototype.save as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await createInterest(mockUserId, mockInterests);

    expect(result).toEqual({
      status: "error",
      message: mockError,
    });
  });
});
