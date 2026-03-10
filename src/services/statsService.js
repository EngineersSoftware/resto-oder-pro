import order from "../models/order.js";

export const getDashboardStats = async () => {
    const totalVentas = await order.aggregate([
        { $match: { estado: 'Entregado' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const  topPlatos = await order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.plato', totalVendido: { $sum: '$items.cantidad' } } },
        { $sort: { totalVendido: -1 } },
        { $limit: 5 }
    ]);

    return {  ingresosTotales: totalVentas[0]?.total || 0,  topPlatos };
}
