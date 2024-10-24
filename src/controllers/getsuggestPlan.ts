import { postgreClient } from "..";

const getSuggestPlan = async (userId: string) => {
  try {
    const getpublicPlansFromOtherUsers = await postgreClient.query(
      "SELECT pp.plan_id FROM users_plans AS up INNER JOIN public_plan AS pp ON up.plan_id = pp.plan_id WHERE user_id != ($1)",[userId]
    );
    if (getpublicPlansFromOtherUsers.rows.length === 0) {
      return {
        success: false,
        message: "No public plan found",
      };
    }

    return {
      success: true,
      plansList: getpublicPlansFromOtherUsers.rows.map((plan) => plan.plan_id),
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getSuggestPlan;
