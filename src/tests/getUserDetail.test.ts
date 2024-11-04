import getUserDetail from "../controllers/getUserDetail"; 
import { postgreClient } from "..";

// Mock the necessary module
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

describe("getUserDetail", () => {
  const mockUserId = "testUserId";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user details when user is found", async () => {
    const mockUserData = {
      id: mockUserId,
      username: "testUser",
    };

    // Mock the PostgreSQL query to return a user
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: [mockUserData],
    });

    const response = await getUserDetail(mockUserId);

    expect(postgreClient.query).toHaveBeenCalledWith(
      "SELECT id, username FROM users WHERE id = ($1)",
      [mockUserId]
    );
    expect(response).toEqual({
      success: true,
      user: mockUserData,
    });
  });

  it("should return an error if no user is found", async () => {
    // Mock the PostgreSQL query to return no rows
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: [],
    });

    const response = await getUserDetail(mockUserId);

    expect(response).toEqual({
      success: false,
      message: "No user found",
    });
  });

  it("should return an error if an exception occurs", async () => {
    const errorMessage = "Database error";
    
    // Mock the PostgreSQL query to throw an error
    (postgreClient.query as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const response = await getUserDetail(mockUserId);

    expect(response).toEqual({
      success: false,
      message: expect.any(Error),
    });
  });
});
