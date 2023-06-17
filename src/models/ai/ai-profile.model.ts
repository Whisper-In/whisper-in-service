import { Schema, model } from "mongoose";

const namePlaceholder = "{{assistantName}}";

interface IPriceTier {
  tier: number;
  price: number;
}

interface IAIProfile {
  _id: string;
  name: string;
  userName: string;
  avatar?: string;
  baseCharacterPrompt: string;
  characterPrompt: string;
  isDefault: boolean;
  priceTiers: IPriceTier[];
}

const PriceTierSchema = new Schema<IPriceTier>({
  price: Number,
  tier: Number
});

const AIProfileSchema = new Schema<IAIProfile>(
  {
    name: String,
    userName: { type: String, unique: true },
    avatar: { type: String, required: false },
    baseCharacterPrompt: String,
    isDefault: Boolean,
    priceTiers: {type: [PriceTierSchema], required: false}
  },
  {
    timestamps: true,
  }
);

AIProfileSchema.virtual("characterPrompt").get(function () {
  return this.baseCharacterPrompt.replace(namePlaceholder, this.name);
});

const AIProfile = model("AIProfile", AIProfileSchema);

export { AIProfile };
