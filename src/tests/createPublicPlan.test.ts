import createpublicPlan from "../controllers/createpublicPlan"; 
import planGenerateModel from "../mongoose/planGenerateModel";
import { postgreClient } from ".."; 

// Mock the necessary modules
jest.mock("../mongoose/planGenerateModel");
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

describe("createpublicPlan", () => {
  const mockPlanId = "testPlanId";

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls
  });

  it("should make a plan public if it exists", async () => {
    // Mock the findById method to return a valid plan
    (planGenerateModel.findById as jest.Mock).mockResolvedValueOnce({ _id: mockPlanId });

    // Mock the PostgreSQL query to succeed
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const response = await createpublicPlan(mockPlanId);

    expect(planGenerateModel.findById).toHaveBeenCalledWith(mockPlanId);
    expect(postgreClient.query).toHaveBeenCalledWith(
      "INSERT INTO public_plan (plan_id) VALUES ($1)",
      [mockPlanId]
    );
    expect(response).toEqual({
      success: true,
      message: "This plan is now public",
    });
  });

  it("should return an error if the plan does not exist", async () => {
    // Mock the findById method to return null (simulating a non-existent plan)
    (planGenerateModel.findById as jest.Mock).mockResolvedValueOnce(null);

    const response = await createpublicPlan(mockPlanId);

    expect(response).toEqual({
      success: false,
      message: "plan not found in the plans collection or already public",
    });
  });

  it("should return an error if inserting into PostgreSQL fails", async () => {
    // Mock the findById method to return a valid plan
    (planGenerateModel.findById as jest.Mock).mockResolvedValueOnce({ _id: mockPlanId });
    
    // Mock the PostgreSQL query to reject
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(new Error("PostgreSQL error"));

    const response = await createpublicPlan(mockPlanId);

    expect(response).toEqual({
      success: false,
      message: "plan not found in the plans collection or already public",
    });
  });
});
