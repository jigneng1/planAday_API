import getPlanDetailById from "../controllers/getPlanDetailById"; 
import planGenerateModel from "../mongoose/planGenerateModel";
import { postgreClient } from "..";

// Mock the necessary modules
jest.mock("../mongoose/planGenerateModel");
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

describe("getPlanDetailById", () => {
  const mockPlanId = "mockPlanId";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the plan details with public status", async () => {
    const mockPlanData = {
      _id: mockPlanId,
      name: "Test Plan",
      description: "A sample plan",
      toJSON: jest.fn().mockReturnValue({
        _id: mockPlanId,
        name: "Test Plan",
        description: "A sample plan",
      }),
    };

    const mockPublicPlan = {
      rows: [{ plan_id: mockPlanId }],
    };

    // Mock the implementation of planGenerateModel.findById
    (planGenerateModel.findById as jest.Mock).mockResolvedValue(mockPlanData);
    
    // Mock the PostgreSQL query to return a public plan
    (postgreClient.query as jest.Mock).mockResolvedValueOnce(mockPublicPlan);

    const response = await getPlanDetailById(mockPlanId);

    expect(planGenerateModel.findById).toHaveBeenCalledWith(mockPlanId);
    expect(postgreClient.query).toHaveBeenCalledWith(
      "SELECT * FROM public_plan WHERE plan_id = ($1)",
      [mockPlanId]
    );
    expect(response).toEqual({
      _id: mockPlanId,
      name: "Test Plan",
      description: "A sample plan",
      public: true,
    });
  });

  it("should return an error if no plan is found", async () => {
    // Mock the implementation of planGenerateModel.findById to return null
    (planGenerateModel.findById as jest.Mock).mockResolvedValue(null);

    const response = await getPlanDetailById(mockPlanId);

    expect(response).toEqual({
      success: false,
      message: "No plan found",
    });
  });

  it("should return an error if an exception occurs", async () => {
    const errorMessage = "Database error";
    
    // Mock the implementation of planGenerateModel.findById to throw an error
    (planGenerateModel.findById as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const response = await getPlanDetailById(mockPlanId);

    expect(response).toEqual({
      success: false,
      message: expect.any(Error),
    });
  });
});
