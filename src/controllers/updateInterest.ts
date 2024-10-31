import userInterestModel from "../mongoose/userInterestModel";

const updateInterest = async (userId: string, interest: string[]) => {
  try {
    const userInterest = await userInterestModel.findOne({ user_id: userId });
    if (!userInterest) {
      return {
        status: "error",
        message: "User not found",
      };
    }
    userInterest.interests = interest;
    await userInterest.save();
    return {
      status: "success",
      message: "Interest updated",
    };
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default updateInterest;
