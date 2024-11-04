import { postgreClient } from "..";
import planGenerateModel, { IPlanMongo } from "../mongoose/planGenerateModel";

const createGeneratePlan = async (
  GeneratedPlans: IPlanMongo,
  userId: string
) => {
  try {
    const newPlan = new planGenerateModel(GeneratedPlans);
    const savePlan = await newPlan.save();
    // get PLan ID Save it in Postgres
    await postgreClient.query(
      "INSERT INTO users_plans (user_id, plan_id) VALUES ($1, $2)",
      [userId, savePlan._id.toString()] 
    );
    return {
      success: true,
      planId: savePlan._id.toString(), 
      message: "Plan generated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export default createGeneratePlan;
