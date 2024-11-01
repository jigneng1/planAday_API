import userInterestModel from "../mongoose/userInterestModel";

const createInterest = async (userId: string, interest: string[]) => {
  try {
    const newInterest = new userInterestModel({
      user_id: userId,
      interests: interest,
    });
    await newInterest.save();
    return {
      status: "success",
      message: "Interest created",
    };
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
};

export default createInterest;
