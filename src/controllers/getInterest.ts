import userInterestModel from "../mongoose/userInterestModel";

const getInterest = async (user_id: string) => {
  try {
    const userInterest = await userInterestModel.findOne({ user_id: user_id });
    if (!userInterest) {
      return {
        status: "error",
        message: "User not found",
      };
    }
    return {
      status: "success",
      interest: userInterest.interests,
    };
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default getInterest;
