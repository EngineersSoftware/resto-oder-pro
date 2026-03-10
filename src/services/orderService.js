import Order from '../models/order.js';
import menuItem from '../models/menuItem.js';

export const createOrder = async (items, meseroId) => {
    let subtotal = 0;
    const intemsParaOrden = [];
    
    for(const item of items) {
        const plato = await menuItem.findById(item.platoId).populate('ingredientes.ingredienteId');
        if(!plato || !plato.disponible) throw new Error (`Plato no disponible: ${item.platoId}`);

        for(const receta of plato.ingredientes) {
            const ingrendiente = receta.ingredienteId;
            const cantidadNecesaria = receta.cantidad * item.cantidad;
            if(ingrendiente.stock < cantidadNecesaria) {
                throw new Error(`Insumos insuficientes para ${plato.nombre}`);
            }

            ingrendiente.stock -= cantidadNecesaria;
            await ingrendiente.save();
        }

        subtotal += plato.precio * item.cantidad;
        intemsParaOrden.push({ plato: plato._id, cantidad: item.cantidad });
    }

    const totalConPropina = subtotal * 1.10; // Agregar 10% de propina sugerida

    return await Order.create({
        meseroId,
        items: intemsParaOrden,
        total: totalConPropina.toFixed(2),
        estado: 'pendiente'
    });
}

export const updateOrderStatus = async (orderId, nuevoEstado) => {
    const validSatates = ['pendiente', 'Preparando', 'listo', 'Entregado', 'cancelado'];
    if(!validSatates.includes(nuevoEstado)) throw new Error('Estado no válido');

    return await Order.findByIdAndUpdate(orderId, { estado: nuevoEstado }, { new: true }).populate('meseroId', 'nombre');
}