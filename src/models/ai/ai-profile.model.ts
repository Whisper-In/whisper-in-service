import { Schema, model } from "mongoose";

const namePlaceholder = "<%assistantName%>";

interface IAIProfile {
  name: string;
  avatar?: string;
  baseCharacterPrompt: string;
  characterPrompt: string;
  isDefault: boolean
}

const AIProfileSchema = new Schema<IAIProfile>(
  {
    name: String,
    avatar: { type: String, required: false },
    baseCharacterPrompt: String,
    isDefault: Boolean
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
