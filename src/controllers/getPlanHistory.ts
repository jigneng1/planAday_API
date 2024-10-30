import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

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

    // get plan detail from mongo by plan_id
    const getPlan = await Promise.all(
      getPlanHistory.rows.map(async (plan) => {
        return await planGenerateModel.findById(plan.plan_id);
      })
    );

    if (!getPlan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    // Format planName , category, numberofPlaces, imageURL
    const formattedResponse = getPlan.map((plan) => {
      return {
        planId: plan!._id,
        planName: plan!.planName,
        numberofPlaces: plan!.numberOfPlaces,
        category: plan!.category,
        imageURL: plan!.selectedPlaces[0].photosUrl,
      };
    });

    return {
      success: true,
      planHistory: formattedResponse,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getPlanHistory;
