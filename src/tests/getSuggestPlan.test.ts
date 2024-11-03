import getSuggestPlan from "../controllers/getsuggestPlan"; // adjust the path
import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

jest.mock("../mongoose/planGenerateModel");

describe("getSuggestPlan", () => {
  const mockUserId = "12345";
  const mockPlansFromOtherUsers = [
    { plan_id: "plan1" },
    { plan_id: "plan2" },
  ];

  const mockPlanDetails = [
    {
      _id: "plan1",
      planName: "Hello World",
      numberOfPlaces: 4,
      category: ["Gym", "Park"],
      selectedPlaces: [{ photosUrl: "image1.jpg" }],
    },
    {
      _id: "plan2",
      planName: "City Tour",
      numberOfPlaces: 5,
      category: ["Cafe", "Store", "Museum"],
      selectedPlaces: [{ photosUrl: "image2.jpg" }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of suggested plans from other users", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: mockPlansFromOtherUsers,
    });

    (planGenerateModel.findById as jest.Mock).mockImplementation((planId) => {
      return Promise.resolve(
        mockPlanDetails.find((plan) => plan._id === planId)
      );
    });

    const result = await getSuggestPlan(mockUserId);

    expect(result).toEqual({
      success: true,
      plansList: [
        {
          planId: "plan1",
          planName: "Hello World",
          numberofPlaces: 4,
          category: ["Gym", "Park"],
          imageURL: "image1.jpg",
        },
        {
          planId: "plan2",
          planName: "City Tour",
          numberofPlaces: 5,
          category: ["Cafe", "Store", "Museum"],
          imageURL: "image2.jpg",
        },
      ],
    });
    expect(postgreClient.query).toHaveBeenCalledWith(
      "SELECT pp.plan_id FROM users_plans AS up INNER JOIN public_plan AS pp ON up.plan_id = pp.plan_id WHERE user_id != ($1)",
      [mockUserId]
    );
    expect(planGenerateModel.findById).toHaveBeenCalledTimes(2);
  });

  it("should return an empty list if no plans from other users are found", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const result = await getSuggestPlan(mockUserId);

    expect(result).toEqual({
      success: false,
      plansList: [],
    });
    expect(postgreClient.query).toHaveBeenCalled();
  });

  it("should handle errors during the process", async () => {
    const mockError = new Error("Database error");
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await getSuggestPlan(mockUserId);

    expect(result).toEqual({
      success: false,
      message: mockError,
    });
    expect(postgreClient.query).toHaveBeenCalled();
  });
});
