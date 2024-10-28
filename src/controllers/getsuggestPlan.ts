import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

const getSuggestPlan = async (userId: string) => {
  try {
    const getpublicPlansFromOtherUsers = await postgreClient.query(
      "SELECT pp.plan_id FROM users_plans AS up INNER JOIN public_plan AS pp ON up.plan_id = pp.plan_id WHERE user_id != ($1)",
      [userId]
    );
    if (getpublicPlansFromOtherUsers.rows.length === 0) {
      return {
        success: false,
        message: "No public plan found",
      };
    }

    // get plan detail from mongo by plan_id
    const getPlan = await planGenerateModel.findById(
      getpublicPlansFromOtherUsers.rows[0].plan_id
    );

    const uniqueType = [
      ...new Set(getPlan?.places.map((place) => place.primaryType)),
    ];

    const formattedResponse = getpublicPlansFromOtherUsers.rows.map((plan) => {
      return {
        plan_id: plan.plan_id,
        place_num: getPlan?.places.length,
        uniqueType: uniqueType,
        imageURL: getPlan?.places[0].photosUrl,
      };
    });

    // return category and plan
    return {
      success: true,
      plansList: formattedResponse,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getSuggestPlan;
