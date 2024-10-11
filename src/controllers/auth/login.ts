import { postgreClient } from "../..";

const login = async (username: string, password: string) => {
  try {
    const findUser = await postgreClient.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (findUser.rows.length === 0) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    // compare password
    const comparePassword = await Bun.password.verify(
      password,
      findUser.rows[0].password
    );

    if (comparePassword == false) {
      return {
        success: false,
        payload: "password not correct",
      };
    }

    return {
      status: "success",
      message: "Login successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default login;
