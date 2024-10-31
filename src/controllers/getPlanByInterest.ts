import userInterestModel from "../mongoose/userInterestModel";
import getSuggestPlan from "./getsuggestPlan";

const getPlanByInterest = async (userId: string, category: string) => {
  try {
    const allPlans = await getSuggestPlan(userId);
    const getPlansByCategory = allPlans.plansList?.filter((plan) => {
      return plan.category.includes(category);
    });
    return {
      success: true,
      plansList: getPlansByCategory,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getPlanByInterest;
