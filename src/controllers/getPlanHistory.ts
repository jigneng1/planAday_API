import { postgreClient } from "..";

const getPlanHistory = async (userId: string) => {
  try {
    const getPlanHistory = await postgreClient.query(
      "SELECT plan_id FROM users_plans WHERE user_id = ($1)",
      [userId]
    );
    if (getPlanHistory.rows.length === 0) {
      return {
        success: false,
        message: "No plan history found",
      };
    }
    return {
      success: true,
      planHistory: getPlanHistory.rows.map((plan) => plan.plan_id),
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getPlanHistory;
