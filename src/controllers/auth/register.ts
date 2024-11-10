import { postgreClient } from "../..";
import createInterest from "../createInterest";

const register = async (username: string, password: string) => {
  // use bcrypt
  try {
    const bcryptHash = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10, // salt
    });
    const exitUser = await postgreClient.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (exitUser.rows.length > 0) {
      return {
        status: "error",
        message: "User already exist",
      };
    }

    const userId = crypto.randomUUID();

    await postgreClient.query(
      "INSERT INTO users (id ,username, password) VALUES ($1, $2, $3)",
      [userId, username, bcryptHash]
    );

    await createInterest(userId, ["restaurant", "cafe"]);

    return {
      status: "success",
      message: "User created successfully",
    };
    return exitUser.rows;
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default register;
