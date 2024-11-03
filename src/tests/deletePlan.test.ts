import deletePlan from "../controllers/deletePlan";
import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

jest.mock("../mongoose/planGenerateModel", () => ({
  findByIdAndDelete: jest.fn(),
}));

describe("deletePlan", () => {
  const mockPlanId = "plan123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return success message when plan is deleted from both Postgres and MongoDB", async () => {
    // Mock successful deletion for Postgres and MongoDB
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockResolvedValueOnce({});
    (planGenerateModel.findByIdAndDelete as jest.Mock).mockResolvedValueOnce({});

    const result = await deletePlan(mockPlanId);

    expect(result).toEqual({
      success: true,
      message: "Plan deleted successfully",
    });

    expect(postgreClient.query).toHaveBeenNthCalledWith(1, "DELETE FROM public_plan WHERE plan_id = ($1)", [mockPlanId]);
    expect(postgreClient.query).toHaveBeenNthCalledWith(2, "DELETE FROM users_plans WHERE plan_id = ($1)", [mockPlanId]);
    expect(postgreClient.query).toHaveBeenNthCalledWith(3, "DELETE FROM bookmarks WHERE plan_id = ($1)", [mockPlanId]);
    expect(planGenerateModel.findByIdAndDelete).toHaveBeenCalledWith(mockPlanId);
  });

  it("should return an error message if deletion from Postgres fails", async () => {
    const mockError = new Error("Postgres deletion error");

    // Mock Postgres failure
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await deletePlan(mockPlanId);

    expect(result).toEqual({
      success: false,
      message: mockError,
    });

    expect(postgreClient.query).toHaveBeenCalledWith(
      "DELETE FROM public_plan WHERE plan_id = ($1)",
      [mockPlanId]
    );
    expect(planGenerateModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("should return an error message if deletion from MongoDB fails", async () => {
    const mockError = new Error("MongoDB deletion error");

    // Mock successful Postgres deletion but MongoDB deletion failure
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockResolvedValueOnce({});
    (planGenerateModel.findByIdAndDelete as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await deletePlan(mockPlanId);

    expect(result).toEqual({
      success: false,
      message: mockError,
    });

    expect(postgreClient.query).toHaveBeenCalledTimes(3);
    expect(planGenerateModel.findByIdAndDelete).toHaveBeenCalledWith(mockPlanId);
  });
});
