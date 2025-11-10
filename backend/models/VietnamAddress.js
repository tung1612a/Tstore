import mongoose from 'mongoose';

const vietnamAddressSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    communes: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

vietnamAddressSchema.index({ city: 'text' });
vietnamAddressSchema.index({ city: 1 });

const VietnamAddress = mongoose.model('VietnamAddress', vietnamAddressSchema);

export default VietnamAddress;
