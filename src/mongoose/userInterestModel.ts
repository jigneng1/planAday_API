import mongoose from "mongoose";

export interface IUserInterestMongo {
  user_id: string;
  interests: string[];
}

const userInterestSchema = new mongoose.Schema<IUserInterestMongo>(
  {
    user_id: { type: String, required: true, unique: true },
    interests: { type: [String], required: true },
  },
  { versionKey: false }
);

export default mongoose.model<IUserInterestMongo>(
  "UserInterest",
  userInterestSchema
);
