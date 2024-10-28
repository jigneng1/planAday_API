import planGenerateModel from "../mongoose/planGenerateModel";

const getPlanDetailById = async (plan_id: string) => {
  try {
    const getPlan = await planGenerateModel.findById(plan_id);
    if (!getPlan) {
      return {
        success: false,
        message: "No plan found",
      };
    }
    return getPlan.toJSON();
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export default getPlanDetailById;
