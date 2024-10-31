import { postgreClient } from "..";
import planGenerateModel from "../mongoose/planGenerateModel";

const deletePlan = async (plan_id: string) => {
  try {
    // Delete Plan from Postgres
    await postgreClient.query("DELETE FROM public_plan WHERE plan_id = ($1)", [
      plan_id,
    ]);
    await postgreClient.query("DELETE FROM users_plans WHERE plan_id = ($1)", [
      plan_id,
    ]);
    await postgreClient.query("DELETE FROM bookmarks WHERE plan_id = ($1)", [
      plan_id,
    ]);
    // Delete Plan from Mongo
    await planGenerateModel.findByIdAndDelete(plan_id);
    return {
      success: true,
      message: "Plan deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default deletePlan;
