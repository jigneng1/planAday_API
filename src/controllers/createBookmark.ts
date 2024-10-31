import { postgreClient } from "..";

const createBookmark = async (userId: string, planId: string) => {
  try {
    await postgreClient.query(
      `INSERT INTO bookmarks (user_id, plan_id) VALUES ('${userId}', '${planId}')`
    );
    return {
      status: "success",
      message: "Bookmark created",
    };
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default createBookmark;
