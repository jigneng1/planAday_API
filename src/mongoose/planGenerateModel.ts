import mongoose from "mongoose";

export interface IPlanMongo {
  planName: string;
  startTime: string;
  startDate: string;
  category: string[];
  numberOfPlaces: number;
  planID: string;
  selectedPlaces: {
    id: string;
    displayName: string;
    primaryType?: string;
    shortFormattedAddress: string;
    photosUrl: string;
  }[];
}

const planSchema = new mongoose.Schema<IPlanMongo>(
  {
    planName: { type: String, required: true },
    startTime: { type: String, required: true },
    startDate: { type: String, required: true },
    category: { type: [String], required: true },
    numberOfPlaces: { type: Number, required: true },
    planID: { type: String, required: true },
    selectedPlaces: [
      {
        id: { type: String, required: true },
        displayName: { type: String, required: true },
        primaryType: { type: String },
        shortFormattedAddress: { type: String, required: true },
        photosUrl: { type: String },
      },
    ],
  },
  { versionKey: false }
);

export default mongoose.model<IPlanMongo>("Plan", planSchema);
