import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

const getPlanDetailById = async (plan_id: string) => {
  try {
    const getPlan = await planGenerateModel.findById(plan_id);
    // Check is plan is public
    const getPublicPlan = await postgreClient.query(
      "SELECT * FROM public_plan WHERE plan_id = ($1)",
      [plan_id]
    );
    if (!getPlan) {
      return {
        success: false,
        message: "No plan found",
      };
    }
    let check = false;
    if (getPublicPlan.rows.length > 0) {
      check = true;
    }
    const formattedResponse = {
      ...getPlan.toJSON(),
      public: check,
    };
    return formattedResponse;
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getPlanDetailById;
