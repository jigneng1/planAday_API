import mongoose from "mongoose";

export interface IPlanMongo {
  places: {
    id: string;

    displayName: string;

    primaryType: string;

    shortFormattedAddress: string;

    photosUrl: string;
  }[];
}

const planSchema = new mongoose.Schema<IPlanMongo>(
  {
    places: [
      {
        id: { type: String, required: true },
        displayName: { type: String, required: true },
        primaryType: { type: String, required: true },
        shortFormattedAddress: { type: String, required: true },
        photosUrl: { type: String },
      },
    ],
  },
  { versionKey: false }
);

export default mongoose.model<IPlanMongo>("Plan", planSchema);
