import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

const createpublicPlan = async (planId: string) => {
  try {
    // check if the planId exist in the plans collection
    await planGenerateModel.findById(planId);
    // put the planId in the public_plan table
    await postgreClient.query("INSERT INTO public_plan (plan_id) VALUES ($1)", [
      planId,
    ]);
    return {
      success: true,
      message: "This plan is now public",
    };
  } catch (error) {
    return {
      success: false,
      message: "plan not found in the plans collection or already public",
    };
  }
};

export default createpublicPlan;
