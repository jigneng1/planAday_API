import createBookmark from "../controllers/createBookmark"; 
import { postgreClient } from "..";

// Mock the postgreClient
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

describe("createBookmark", () => {
  const mockUserId = "testUserId";
  const mockPlanId = "testPlanId";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a bookmark successfully", async () => {
    // Mock the successful database query
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({});

    const response = await createBookmark(mockUserId, mockPlanId);

    expect(postgreClient.query).toHaveBeenCalledWith(
      `INSERT INTO bookmarks (user_id, plan_id) VALUES ('${mockUserId}', '${mockPlanId}')`
    );
    expect(response).toEqual({
      status: "success",
      message: "Bookmark created",
    });
  });

  it("should return an error message if the database query fails", async () => {
    const errorMessage = "Database error";

    // Mock the database query to throw an error
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const response = await createBookmark(mockUserId, mockPlanId);

    expect(response).toEqual({
      status: "error",
      message: expect.any(Error), 
    });
  });
});
