const db = require('../../models');
const calculadoraService = require('./calculadoraService');

const planPagoService = {
  /**
   * Generar plan de pagos para un préstamo
   * @param {number} idPrestamo - ID del préstamo
   * @param {Object} transaction - Transacción de Sequelize (opcional)
   * @returns {Array} - Plan de pagos creado
   */
  async generarPlanPagos(idPrestamo, transaction = null) {
    try {
      // Obtener datos del préstamo
      const prestamo = await db.Prestamo.findByPk(idPrestamo, {
        include: [{
          model: db.TipoPrestamo,
          as: 'tipoPrestamo'
        }],
        transaction
      });

      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      // Generar tabla de amortización
      const fechaDesembolso = prestamo.fecha_desembolso || new Date();
      const tablaAmortizacion = calculadoraService.generarTablaAmortizacion(
        prestamo.monto,
        prestamo.tasa_interes,
        prestamo.plazo_meses,
        fechaDesembolso
      );

      // Crear registros en la base de datos
      const planPagosPromises = tablaAmortizacion.map(cuota => {
        return db.PlanPago.create({
          id_prestamo: idPrestamo,
          numero_cuota: cuota.numero_cuota,
          fecha_vencimiento: cuota.fecha_vencimiento,
          monto_cuota: cuota.monto_cuota,
          monto_capital: cuota.capital,
          monto_interes: cuota.interes,
          saldo_restante: cuota.saldo_restante,
          estado: 'pendiente'
        }, { transaction });
      });

      const planPagos = await Promise.all(planPagosPromises);

      return planPagos;
    } catch (error) {
      console.error('Error al generar plan de pagos:', error);
      throw error;
    }
  },

  /**
   * Obtener siguiente cuota pendiente de un préstamo
   * @param {number} idPrestamo - ID del préstamo
   * @returns {Object|null} - Siguiente cuota pendiente o null
   */
  async obtenerSiguienteCuota(idPrestamo) {
    try {
      const siguienteCuota = await db.PlanPago.findOne({
        where: {
          id_prestamo: idPrestamo,
          estado: 'pendiente'
        },
        order: [['numero_cuota', 'ASC']]
      });

      return siguienteCuota;
    } catch (error) {
      console.error('Error al obtener siguiente cuota:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las cuotas vencidas de un préstamo
   * @param {number} idPrestamo - ID del préstamo
   * @returns {Array} - Cuotas vencidas
   */
  async obtenerCuotasVencidas(idPrestamo) {
    try {
      const hoy = new Date();
      
      const cuotasVencidas = await db.PlanPago.findAll({
        where: {
          id_prestamo: idPrestamo,
          estado: 'pendiente',
          fecha_vencimiento: {
            [db.Sequelize.Op.lt]: hoy
          }
        },
        order: [['numero_cuota', 'ASC']]
      });

      return cuotasVencidas;
    } catch (error) {
      console.error('Error al obtener cuotas vencidas:', error);
      throw error;
    }
  },

  /**
   * Marcar cuota como pagada
   * @param {number} idPlanPago - ID del plan de pago
   * @param {Object} transaction - Transacción de Sequelize
   * @returns {Object} - Plan de pago actualizado
   */
  async marcarCuotaPagada(idPlanPago, transaction = null) {
    try {
      const planPago = await db.PlanPago.findByPk(idPlanPago, { transaction });

      if (!planPago) {
        throw new Error('Cuota no encontrada');
      }

      if (planPago.estado === 'pagado') {
        throw new Error('Esta cuota ya ha sido pagada');
      }

      await planPago.update({
        estado: 'pagado',
        fecha_pago: new Date()
      }, { transaction });

      return planPago;
    } catch (error) {
      console.error('Error al marcar cuota como pagada:', error);
      throw error;
    }
  },

  /**
   * Calcular estado del préstamo basado en pagos
   * @param {number} idPrestamo - ID del préstamo
   * @returns {Object} - Estado del préstamo
   */
  async calcularEstadoPrestamo(idPrestamo) {
    try {
      const planPagos = await db.PlanPago.findAll({
        where: { id_prestamo: idPrestamo },
        order: [['numero_cuota', 'ASC']]
      });

      const totalCuotas = planPagos.length;
      const cuotasPagadas = planPagos.filter(p => p.estado === 'pagado').length;
      const hoy = new Date();
      
      const cuotasVencidas = planPagos.filter(p => 
        p.estado === 'pendiente' && new Date(p.fecha_vencimiento) < hoy
      );

      let nuevoEstado = 'activo';
      
      if (cuotasPagadas === totalCuotas) {
        nuevoEstado = 'finalizado';
      } else if (cuotasVencidas.length > 0) {
        nuevoEstado = 'en_mora';
      }

      const montoRestante = planPagos
        .filter(p => p.estado === 'pendiente')
        .reduce((sum, p) => sum + parseFloat(p.monto_cuota), 0);

      return {
        estado: nuevoEstado,
        total_cuotas: totalCuotas,
        cuotas_pagadas: cuotasPagadas,
        cuotas_pendientes: totalCuotas - cuotasPagadas,
        cuotas_vencidas: cuotasVencidas.length,
        monto_restante: Math.round(montoRestante * 100) / 100,
        porcentaje_completado: Math.round((cuotasPagadas / totalCuotas) * 100)
      };
    } catch (error) {
      console.error('Error al calcular estado del préstamo:', error);
      throw error;
    }
  }
};

module.exports = planPagoService;
