import Inventory from "../models/inventory.js";

export const updateStock = async (id, cantidad) => {
  const item = await Inventory.findById(id);
  if (!item) {
    throw new Error("Ingrediente no encontrado");
  }
  item.stock += cantidad;
  await item.save();

  if (item.stock <= item.minStock) {
    console.warn(
      `Advertencia: El stock de ${item.nombre} está por debajo del mínimo (${item.stock} ${item.unidad})`,
    );
  }
  return item;
};

export const getFullInventory = async () => {
  return await Inventory.find();
};
