import register from "../controllers/auth/register";
import { postgreClient } from "..";

// Mock postgreClient.query and Bun.password.verify
jest.mock("..", () => ({
  postgreClient: {
    query: jest.fn(),
  },
}));

const mockHash = jest.fn();
global.Bun = {
  password: {
    hash: mockHash,
  },
} as any;

describe("register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error if the user already exists", async () => {
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: "existingUserId", username: "existingUser" }],
    });

    const result = await register("existingUser", "password123");

    expect(postgreClient.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE username = $1",
      ["existingUser"]
    );

    expect(result).toEqual({
      status: "error",
      message: "User already exist",
    });
  });

  it("should create a new user successfully", async () => {
    mockHash.mockResolvedValue("hashedPassword123");

    // Mock no existing user found
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({
      rows: [],
    });

    // Mock successful user insertion
    (postgreClient.query as jest.Mock).mockResolvedValueOnce({});

    const result = await register("newUser", "password123");

    // First call - check for existing user
    expect(postgreClient.query).toHaveBeenNthCalledWith(
      1,
      "SELECT * FROM users WHERE username = $1",
      ["newUser"]
    );

    // Second call - insert new user
    expect(postgreClient.query).toHaveBeenNthCalledWith(
      2,
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
      [expect.any(String), "newUser", "hashedPassword123"]
    );

    expect(result).toEqual({
      status: "success",
      message: "User created successfully",
    });
  });

  it("should return an error if there is a database error", async () => {
    // Mock database error
    (postgreClient.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    const result = await register("errorUser", "password123");

    expect(result).toEqual({
      status: "error",
      message: new Error("Database error"),
    });
  });
});
