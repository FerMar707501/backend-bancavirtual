const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { Op } = require('sequelize');

const reporteController = {
  // Reporte de transacciones por período
  async transacciones(req, res) {
    try {
      const { 
        fecha_inicio, 
        fecha_fin, 
        id_cuenta, 
        tipo_transaccion, 
        id_agencia 
      } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return responseHelper.error(res, 'Debe proporcionar fecha_inicio y fecha_fin', 400);
      }

      const where = {
        fecha_transaccion: {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        },
        estado: 'completada'
      };

      if (id_cuenta) {
        where[Op.or] = [
          { id_cuenta_origen: id_cuenta },
          { id_cuenta_destino: id_cuenta }
        ];
      }

      if (tipo_transaccion) {
        where.id_tipo_transaccion = tipo_transaccion;
      }

      const transacciones = await db.Transaccion.findAll({
        where,
        include: [
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            attributes: ['numero_cuenta'],
            include: [
              {
                model: db.Cliente,
                as: 'cliente',
                attributes: ['primer_nombre', 'primer_apellido']
              },
              {
                model: db.Agencia,
                as: 'agencia',
                attributes: ['nombre'],
                where: id_agencia ? { id_agencia } : undefined
              }
            ]
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            attributes: ['numero_cuenta'],
            include: [{
              model: db.Cliente,
              as: 'cliente',
              attributes: ['primer_nombre', 'primer_apellido']
            }]
          },
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          }
        ],
        order: [['fecha_transaccion', 'DESC']]
      });

      const resumen = {
        total_transacciones: transacciones.length,
        monto_total: transacciones.reduce((sum, t) => sum + parseFloat(t.monto), 0),
        por_tipo: {}
      };

      transacciones.forEach(t => {
        const tipo = t.tipoTransaccion.nombre;
        if (!resumen.por_tipo[tipo]) {
          resumen.por_tipo[tipo] = { cantidad: 0, monto: 0 };
        }
        resumen.por_tipo[tipo].cantidad++;
        resumen.por_tipo[tipo].monto += parseFloat(t.monto);
      });

      return responseHelper.success(res, {
        resumen,
        transacciones
      }, 'Reporte de transacciones generado exitosamente');

    } catch (error) {
      console.error('Error al generar reporte de transacciones:', error);
      return responseHelper.error(res, 'Error al generar reporte de transacciones', 500);
    }
  },

  // Reporte de clientes
  async clientes(req, res) {
    try {
      const { estado_cliente, estado_kyc, tiene_cuentas, tiene_prestamos } = req.query;

      const where = {};
      if (estado_cliente) where.estado_cliente = estado_cliente;
      if (estado_kyc) where.estado_kyc = estado_kyc;

      const include = [
        {
          model: db.Cuenta,
          as: 'cuentas',
          attributes: ['id_cuenta', 'numero_cuenta', 'saldo', 'estado'],
          required: tiene_cuentas === 'true'
        },
        {
          model: db.Prestamo,
          as: 'prestamos',
          attributes: ['id_prestamo', 'numero_prestamo', 'monto', 'estado'],
          required: tiene_prestamos === 'true'
        },
        {
          model: db.TelefonoCliente,
          as: 'telefonos'
        }
      ];

      const clientes = await db.Cliente.findAll({
        where,
        include,
        order: [['created_at', 'DESC']]
      });

      const resumen = {
        total_clientes: clientes.length,
        por_estado: {},
        por_kyc: {},
        con_cuentas: clientes.filter(c => c.cuentas.length > 0).length,
        con_prestamos: clientes.filter(c => c.prestamos.length > 0).length
      };

      clientes.forEach(c => {
        resumen.por_estado[c.estado_cliente] = (resumen.por_estado[c.estado_cliente] || 0) + 1;
        resumen.por_kyc[c.estado_kyc] = (resumen.por_kyc[c.estado_kyc] || 0) + 1;
      });

      return responseHelper.success(res, {
        resumen,
        clientes
      }, 'Reporte de clientes generado exitosamente');

    } catch (error) {
      console.error('Error al generar reporte de clientes:', error);
      return responseHelper.error(res, 'Error al generar reporte de clientes', 500);
    }
  },

  // Reporte de préstamos
  async prestamos(req, res) {
    try {
      const { estado, fecha_inicio, fecha_fin, id_agencia } = req.query;

      const where = {};
      if (estado) where.estado = estado;

      if (fecha_inicio && fecha_fin) {
        where.fecha_solicitud = {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      }

      const prestamos = await db.Prestamo.findAll({
        where,
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'primer_nombre', 'primer_apellido', 'dpi']
          },
          {
            model: db.TipoPrestamo,
            as: 'tipoPrestamo'
          },
          {
            model: db.PlanPago,
            as: 'planPagos',
            include: [{
              model: db.PagoPrestamo,
              as: 'pagoPrestamo'
            }]
          }
        ],
        order: [['fecha_solicitud', 'DESC']]
      });

      const resumen = {
        total_prestamos: prestamos.length,
        monto_total: prestamos.reduce((sum, p) => sum + parseFloat(p.monto), 0),
        por_estado: {},
        por_tipo: {}
      };

      prestamos.forEach(p => {
        resumen.por_estado[p.estado] = (resumen.por_estado[p.estado] || 0) + 1;
        const tipo = p.tipoPrestamo.nombre;
        if (!resumen.por_tipo[tipo]) {
          resumen.por_tipo[tipo] = { cantidad: 0, monto: 0 };
        }
        resumen.por_tipo[tipo].cantidad++;
        resumen.por_tipo[tipo].monto += parseFloat(p.monto);
      });

      return responseHelper.success(res, {
        resumen,
        prestamos
      }, 'Reporte de préstamos generado exitosamente');

    } catch (error) {
      console.error('Error al generar reporte de préstamos:', error);
      return responseHelper.error(res, 'Error al generar reporte de préstamos', 500);
    }
  },

  // Reporte de morosidad
  async morosidad(req, res) {
    try {
      const hoy = new Date();

      const prestamos = await db.Prestamo.findAll({
        where: {
          estado: {
            [Op.in]: ['activo', 'en_mora']
          }
        },
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'primer_nombre', 'primer_apellido', 'dpi', 'correo']
          },
          {
            model: db.TipoPrestamo,
            as: 'tipoPrestamo'
          },
          {
            model: db.PlanPago,
            as: 'planPagos',
            where: {
              estado: 'pendiente',
              fecha_vencimiento: {
                [Op.lt]: hoy
              }
            },
            required: false,
            include: [{
              model: db.PagoPrestamo,
              as: 'pagoPrestamo'
            }]
          }
        ]
      });

      const prestamosConMora = prestamos.filter(p => {
        const cuotasVencidas = p.planPagos.filter(plan => 
          !plan.pagoPrestamo && new Date(plan.fecha_vencimiento) < hoy
        );
        return cuotasVencidas.length > 0;
      }).map(p => {
        const cuotasVencidas = p.planPagos.filter(plan => 
          !plan.pagoPrestamo && new Date(plan.fecha_vencimiento) < hoy
        );
        
        const montoMora = cuotasVencidas.reduce((sum, cuota) => 
          sum + parseFloat(cuota.monto_cuota), 0
        );

        const diasMoraMax = Math.max(...cuotasVencidas.map(cuota => {
          const diff = hoy - new Date(cuota.fecha_vencimiento);
          return Math.floor(diff / (1000 * 60 * 60 * 24));
        }));

        return {
          ...p.toJSON(),
          cuotas_vencidas: cuotasVencidas.length,
          monto_mora: montoMora,
          dias_mora: diasMoraMax
        };
      });

      const resumen = {
        total_prestamos_mora: prestamosConMora.length,
        monto_total_mora: prestamosConMora.reduce((sum, p) => sum + p.monto_mora, 0),
        por_rango_dias: {
          '1-30': 0,
          '31-60': 0,
          '61-90': 0,
          'mas_90': 0
        }
      };

      prestamosConMora.forEach(p => {
        if (p.dias_mora <= 30) resumen.por_rango_dias['1-30']++;
        else if (p.dias_mora <= 60) resumen.por_rango_dias['31-60']++;
        else if (p.dias_mora <= 90) resumen.por_rango_dias['61-90']++;
        else resumen.por_rango_dias['mas_90']++;
      });

      return responseHelper.success(res, {
        resumen,
        prestamos_en_mora: prestamosConMora
      }, 'Reporte de morosidad generado exitosamente');

    } catch (error) {
      console.error('Error al generar reporte de morosidad:', error);
      return responseHelper.error(res, 'Error al generar reporte de morosidad', 500);
    }
  },

  // Estado de cuenta
  async estadoCuenta(req, res) {
    try {
      const { idCuenta } = req.params;
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return responseHelper.error(res, 'Debe proporcionar fecha_inicio y fecha_fin', 400);
      }

      const cuenta = await db.Cuenta.findByPk(idCuenta, {
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            include: [{
              model: db.TelefonoCliente,
              as: 'telefonos'
            }]
          },
          {
            model: db.TipoCuenta,
            as: 'tipoCuenta'
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ]
      });

      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      const transacciones = await db.Transaccion.findAll({
        where: {
          [Op.or]: [
            { id_cuenta_origen: idCuenta },
            { id_cuenta_destino: idCuenta }
          ],
          fecha_transaccion: {
            [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
          },
          estado: 'completada'
        },
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            attributes: ['numero_cuenta']
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            attributes: ['numero_cuenta']
          }
        ],
        order: [['fecha_transaccion', 'ASC']]
      });

      const movimientos = transacciones.map(t => {
        const esDebito = t.id_cuenta_origen === parseInt(idCuenta);
        return {
          fecha: t.fecha_transaccion,
          descripcion: t.descripcion,
          tipo: t.tipoTransaccion.nombre,
          referencia: t.numero_transaccion,
          debito: esDebito ? parseFloat(t.monto) : null,
          credito: !esDebito ? parseFloat(t.monto) : null,
          saldo: parseFloat(t.saldo_origen)
        };
      });

      const resumen = {
        saldo_inicial: movimientos.length > 0 ? movimientos[0].saldo - (movimientos[0].debito || 0) + (movimientos[0].credito || 0) : cuenta.saldo,
        saldo_final: cuenta.saldo,
        total_debitos: movimientos.reduce((sum, m) => sum + (m.debito || 0), 0),
        total_creditos: movimientos.reduce((sum, m) => sum + (m.credito || 0), 0),
        cantidad_transacciones: movimientos.length
      };

      return responseHelper.success(res, {
        cuenta: {
          numero_cuenta: cuenta.numero_cuenta,
          tipo: cuenta.tipoCuenta.nombre,
          cliente: `${cuenta.cliente.primer_nombre} ${cuenta.cliente.primer_apellido}`,
          agencia: cuenta.agencia.nombre
        },
        periodo: {
          fecha_inicio,
          fecha_fin
        },
        resumen,
        movimientos
      }, 'Estado de cuenta generado exitosamente');

    } catch (error) {
      console.error('Error al generar estado de cuenta:', error);
      return responseHelper.error(res, 'Error al generar estado de cuenta', 500);
    }
  }
};

module.exports = reporteController;
