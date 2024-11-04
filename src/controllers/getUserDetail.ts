import { postgreClient } from "..";

const getUserDetail = async (userId: string) => {
  try {
    const getUser = await postgreClient.query(
      "SELECT id, username FROM users WHERE id = ($1)",
      [userId]
    );
    if (getUser.rows.length === 0) {
      return {
        success: false,
        message: "No user found",
      };
    }
    return {
      success: true,
      user: getUser.rows[0],
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getUserDetail;
