import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISetting {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  skuSettings: {
    method: "RANDOM" | "SEQUENTIAL" | "CATEGORY_PREFIX";
    prefix: string;
  };
  // Can add more settings here later, like currency, tax rate, etc.
}

export interface ISettingDocument extends ISetting, Document {
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISettingDocument>(
  {
    storeName: {
      type: String,
      required: true,
      default: 'My Store',
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    skuSettings: {
      method: {
        type: String,
        enum: ["RANDOM", "SEQUENTIAL", "CATEGORY_PREFIX"],
        default: "RANDOM",
      },
      prefix: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Setting: Model<ISettingDocument> =
  mongoose.models.Setting || mongoose.model<ISettingDocument>('Setting', SettingSchema);

export default Setting;
