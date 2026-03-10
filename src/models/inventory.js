import { Schema, model } from "mongoose";

const inventorySchema = new Schema({
  nombre: { type: String, required: true },
  stock: { type: Number, required: true },
  unidad: { type: String, required: true },
  minStock: { type: Number, required: true },
});

export default model("Inventory", inventorySchema);
