import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

const getBookmarkByUserId = async (userId: string) => {
  try {
    const bookmarkresponse = await postgreClient.query(
      "SELECT plan_id FROM bookmarks WHERE user_id = $1",
      [userId]
    );
    if (bookmarkresponse.rows.length === 0) {
      return {
        success: false,
        planList: "[]",
      };
    }

    const getPlan = await Promise.all(
      bookmarkresponse.rows.map(async (plan) => {
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
    return {
      success: true,
      planList: getPlan,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getBookmarkByUserId;
