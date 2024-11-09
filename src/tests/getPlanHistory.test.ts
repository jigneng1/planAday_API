import getPlanHistory from "../controllers/getPlanHistory";
import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

jest.mock("../mongoose/planGenerateModel");

describe("getPlanHistory", () => {
  const mockUserId = "12345";
  const mockPlans = [
    {
      _id: "plan1",
      planName: "Hello Day",
      numberOfPlaces: 5,
      category: ["Store","Cafe"],
      selectedPlaces: [{ photosUrl: "image1.jpg" }],
    },
    {
      _id: "plan2",
      planName: "Let's goooo",
      numberOfPlaces: 3,
      category: ["Resturant", "Museum"],
      selectedPlaces: [{ photosUrl: "image2.jpg" }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return formatted plan history successfully", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ plan_id: "plan1" }, { plan_id: "plan2" }],
    });

    (planGenerateModel.findById as jest.Mock).mockImplementation((planId) => {
      return Promise.resolve(mockPlans.find((plan) => plan._id === planId));
    });

    const result = await getPlanHistory(mockUserId);

    expect(result).toEqual({
      success: true,
      planHistory: [
        {
          planId: "plan1",
          planName: "Hello Day",
          numberofPlaces: 5,
          category: ["Store","Cafe"],
          imageURL: "image1.jpg",
        },
        {
          planId: "plan2",
          planName: "Let's goooo",
          numberofPlaces: 3,
          category: ["Resturant", "Museum"],
          imageURL: "image2.jpg",
        },
      ],
    });
    expect(postgreClient.query).toHaveBeenCalledWith(
      "SELECT plan_id FROM users_plans WHERE user_id = ($1)",
      [mockUserId]
    );
    expect(planGenerateModel.findById).toHaveBeenCalledTimes(2);
  });

  it("should return an error if no plan history is found", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const result = await getPlanHistory(mockUserId);

    expect(result).toEqual({
      success: false,
      message: "No plan history found",
    });
  });

  it("should return an error if plan details are not found", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ plan_id: "plan1" }],
    });
    (planGenerateModel.findById as jest.Mock).mockResolvedValueOnce(null);

    const result = await getPlanHistory(mockUserId);

    expect(result).toEqual({
      success: false,
      message: "Plan not found",
    });
  });

  it("should handle errors during the process", async () => {
    const mockError = new Error("Database error");
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await getPlanHistory(mockUserId);

    expect(result).toEqual({
      success: false,
      message: mockError,
    });
  });
});
