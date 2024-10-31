import { postgreClient } from "..";

const deleteBookmark = async (userId: string, planId: string) => {
  try {
    await postgreClient.query(
      "DELETE FROM bookmarks WHERE user_id = $1 AND plan_id = $2",
      [userId, planId]
    );
    return {
      status: "success",
      message: "Bookmark deleted",
    };
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default deleteBookmark;
