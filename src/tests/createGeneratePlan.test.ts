import mongoose from "mongoose";
import createGeneratePlan from "../controllers/createGeneratePlan";
import planGenerateModel, { IPlanMongo } from "../mongoose/planGenerateModel";
import { postgreClient } from "..";

// Mock the necessary modules
jest.mock("../mongoose/planGenerateModel");
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

describe("createGeneratePlan", () => {
  const mockUserId = "testUserId";
  const mockPlanData: IPlanMongo = {
    planName: "Test Plan",
    startTime: "10:00",
    startDate: "2024-10-31",
    category: ["cafe", "resturant"],
    numberOfPlaces: 2,
    planID: "testPlanID",
    selectedPlaces: [
      {
        id: "place1",
        displayName: "Place 1",
        shortFormattedAddress: "123 Test St",
        photosUrl: "http://example.com/photo1.jpg",
      },
      {
        id: "place2",
        displayName: "Place 2",
        shortFormattedAddress: "456 Test Ave",
        photosUrl: "http://example.com/photo2.jpg",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save a generated plan and insert the plan ID into PostgreSQL", async () => {
    const savePlanMock = { _id: new mongoose.Types.ObjectId() };

    // Mock the implementation of planGenerateModel
    (planGenerateModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savePlanMock),
    }));

    // Mock the PostgreSQL query
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const response = await createGeneratePlan(mockPlanData, mockUserId);

    expect(planGenerateModel).toHaveBeenCalledWith(mockPlanData);
    expect(postgreClient.query).toHaveBeenCalledWith(
      "INSERT INTO users_plans (user_id , plan_id) VALUES ($1, $2)",
      [mockUserId, savePlanMock._id.toString()]
    );
    expect(response).toEqual({
      success: true,
      message: "Plan generated successfully",
    });
  });

  it("should return an error if saving the plan fails", async () => {
    const errorMessage = "Failed to save the plan";

    // Mock the implementation of planGenerateModel
    (planGenerateModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error(errorMessage)),
    }));

    const response = await createGeneratePlan(mockPlanData, mockUserId);

    expect(response).toEqual({
      success: false,
      message: expect.any(Error),
    });
  });

  it("should return an error if inserting into PostgreSQL fails", async () => {
    const savePlanMock = { _id: new mongoose.Types.ObjectId() };

    // Mock the implementation of planGenerateModel
    (planGenerateModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savePlanMock),
    }));

    // Mock the PostgreSQL query to reject
    (postgreClient.query as jest.Mock).mockRejectedValue(new Error("PostgreSQL error"));

    const response = await createGeneratePlan(mockPlanData, mockUserId);

    expect(response).toEqual({
      success: false,
      message: expect.any(Error),
    });
  });
});
