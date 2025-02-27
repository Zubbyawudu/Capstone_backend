import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  mileage: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

const Car = mongoose.model("Car", CarSchema);
export default Car;
