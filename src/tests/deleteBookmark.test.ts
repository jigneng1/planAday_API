import deleteBookmark from "../controllers/deleteBookmark";
import { postgreClient } from "..";

jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

describe("deleteBookmark", () => {
  const mockUserId = "user123";
  const mockPlanId = "plan123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return success message when bookmark is deleted", async () => {
    // Mock successful deletion
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({});

    const result = await deleteBookmark(mockUserId, mockPlanId);

    expect(result).toEqual({
      status: "success",
      message: "Bookmark deleted",
    });
    expect(postgreClient.query).toHaveBeenCalledWith(
      "DELETE FROM bookmarks WHERE user_id = $1 AND plan_id = $2",
      [mockUserId, mockPlanId]
    );
  });

  it("should return an error message when deletion fails", async () => {
    const mockError = new Error("Database error");

    // Mock failed deletion
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await deleteBookmark(mockUserId, mockPlanId);

    expect(result).toEqual({
      status: "error",
      message: mockError,
    });
    expect(postgreClient.query).toHaveBeenCalledWith(
      "DELETE FROM bookmarks WHERE user_id = $1 AND plan_id = $2",
      [mockUserId, mockPlanId]
    );
  });
});
