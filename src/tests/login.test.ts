import login from "../controllers/auth/login";
import { postgreClient } from "..";

// Mock postgreClient.query and Bun.password.verify
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

const mockVerify = jest.fn();

global.Bun = {
  password: {
    verify: mockVerify,
  },
} as any;

describe("login function", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
    password: "hashedPassword",
  };

  beforeEach(() => {
    mockVerify.mockReset();
  });

  it("should return user ID when credentials are correct", async () => {
    // Setup mock behavior
    mockVerify.mockResolvedValue(true);
    postgreClient.query = jest.fn().mockResolvedValue({
      rows: [{ id: 1, password: "hashed_password" }],
    });

    // Run the login function and check the result
    const result = await login("username", "password");
    expect(result).toBe(1);
  });

  test("should return error if user is not found", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValue({ rows: [] });

    const response = await login("nonexistentuser", "password");

    expect(response).toEqual({
      status: "error",
      message: "User not found",
    });
  });

  test("should return error if password is incorrect", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
    (Bun.password.verify as jest.Mock).mockResolvedValue(false);

    const response = await login("testuser", "wrongpassword");

    expect(response).toEqual({
      status: "error",
      payload: "password not correct",
    });
  });

  test("should return user ID if login is successful", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
    (Bun.password.verify as jest.Mock).mockResolvedValue(true);

    const response = await login("testuser", "password");

    expect(response).toBe(mockUser.id);
  });

  test("should handle unexpected errors", async () => {
    const errorMessage = "Database error";
    (postgreClient.query as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const response = await login("testuser", "password");

    expect(response).toEqual({
      status: "error",
      message: new Error(errorMessage),
    });
  });
});
