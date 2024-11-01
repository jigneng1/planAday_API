import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

// เอา Public Plan จาก user อื่นมาแสดง filter Plan ที่ Bookmarks ไปแล้วออก

const getSuggestPlan = async (userId: string) => {
  try {
    const getpublicPlansFromOtherUsers = await postgreClient.query(
      "SELECT pp.plan_id FROM users_plans AS up INNER JOIN public_plan AS pp ON up.plan_id = pp.plan_id WHERE up.user_id != $1 AND pp.plan_id NOT IN (SELECT plan_id FROM bookmarks WHERE user_id = $1)",
      [userId]
    );
    if (getpublicPlansFromOtherUsers.rows.length === 0) {
      return {
        success: false,
        plansList: [],
      };
    }

    // get plan detail from mongo by plan_id
    // เปลี่ยนเป็น promise.all()

    const getPlan = await Promise.all(
      getpublicPlansFromOtherUsers.rows.map(async (plan) => {
        const response = await planGenerateModel.findById(plan.plan_id);
        return {
          planId: response!._id,
          planName: response!.planName,
          numberofPlaces: response!.numberOfPlaces,
          category: response!.category,
          imageURL: response!.selectedPlaces[0].photosUrl,
        };
      })
    );

    if (!getPlan) {
      return {
        success: false,
        plansList: [],
      };
    }

    // return category and plan
    return {
      success: true,
      plansList: getPlan,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getSuggestPlan;
