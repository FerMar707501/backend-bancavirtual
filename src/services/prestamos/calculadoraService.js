/**
 * Servicio de cálculo para préstamos
 * Calcula cuotas, intereses, montos y demás cálculos relacionados con préstamos
 */

const calculadoraService = {
  /**
   * Calcular cuota mensual usando sistema francés (cuota fija)
   * @param {number} monto - Monto del préstamo
   * @param {number} tasaAnual - Tasa de interés anual (porcentaje)
   * @param {number} plazoMeses - Plazo en meses
   * @returns {number} - Cuota mensual
   */
  calcularCuotaMensual(monto, tasaAnual, plazoMeses) {
    const tasaMensual = tasaAnual / 100 / 12;
    
    if (tasaMensual === 0) {
      return monto / plazoMeses;
    }

    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                  (Math.pow(1 + tasaMensual, plazoMeses) - 1);
    
    return Math.round(cuota * 100) / 100;
  },

  /**
   * Generar tabla de amortización completa
   * @param {number} monto - Monto del préstamo
   * @param {number} tasaAnual - Tasa de interés anual (porcentaje)
   * @param {number} plazoMeses - Plazo en meses
   * @param {Date} fechaInicio - Fecha del primer pago
   * @returns {Array} - Tabla de amortización
   */
  generarTablaAmortizacion(monto, tasaAnual, plazoMeses, fechaInicio = new Date()) {
    const cuotaMensual = this.calcularCuotaMensual(monto, tasaAnual, plazoMeses);
    const tasaMensual = tasaAnual / 100 / 12;
    
    const tabla = [];
    let saldoRestante = monto;
    let fechaActual = new Date(fechaInicio);

    for (let numCuota = 1; numCuota <= plazoMeses; numCuota++) {
      const interes = saldoRestante * tasaMensual;
      const capital = cuotaMensual - interes;
      saldoRestante = saldoRestante - capital;

      // Ajustar última cuota por redondeos
      if (numCuota === plazoMeses && Math.abs(saldoRestante) < 1) {
        saldoRestante = 0;
      }

      // Calcular fecha de vencimiento (siguiente mes)
      const fechaVencimiento = new Date(fechaActual);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

      tabla.push({
        numero_cuota: numCuota,
        fecha_vencimiento: fechaVencimiento,
        monto_cuota: Math.round(cuotaMensual * 100) / 100,
        capital: Math.round(capital * 100) / 100,
        interes: Math.round(interes * 100) / 100,
        saldo_restante: Math.max(0, Math.round(saldoRestante * 100) / 100),
        estado: 'pendiente'
      });

      fechaActual = fechaVencimiento;
    }

    return tabla;
  },

  /**
   * Calcular monto total a pagar
   * @param {number} monto - Monto del préstamo
   * @param {number} tasaAnual - Tasa de interés anual (porcentaje)
   * @param {number} plazoMeses - Plazo en meses
   * @returns {Object} - Desglose de pagos
   */
  calcularMontoTotal(monto, tasaAnual, plazoMeses) {
    const cuotaMensual = this.calcularCuotaMensual(monto, tasaAnual, plazoMeses);
    const montoTotal = cuotaMensual * plazoMeses;
    const interesTotal = montoTotal - monto;

    return {
      monto_prestamo: Math.round(monto * 100) / 100,
      cuota_mensual: Math.round(cuotaMensual * 100) / 100,
      plazo_meses: plazoMeses,
      tasa_anual: tasaAnual,
      monto_total: Math.round(montoTotal * 100) / 100,
      interes_total: Math.round(interesTotal * 100) / 100
    };
  },

  /**
   * Calcular capacidad de pago recomendada
   * @param {number} ingresoMensual - Ingreso mensual del cliente
   * @param {number} porcentajeCompromiso - Porcentaje máximo de compromiso (default 40%)
   * @returns {number} - Capacidad de pago mensual
   */
  calcularCapacidadPago(ingresoMensual, porcentajeCompromiso = 40) {
    return Math.round((ingresoMensual * porcentajeCompromiso / 100) * 100) / 100;
  },

  /**
   * Validar viabilidad del préstamo
   * @param {number} ingresoMensual - Ingreso mensual del cliente
   * @param {number} cuotaMensual - Cuota mensual calculada
   * @param {number} porcentajeMax - Porcentaje máximo de compromiso (default 40%)
   * @returns {Object} - Resultado de viabilidad
   */
  validarViabilidad(ingresoMensual, cuotaMensual, porcentajeMax = 40) {
    const capacidadPago = this.calcularCapacidadPago(ingresoMensual, porcentajeMax);
    const porcentajeCompromiso = (cuotaMensual / ingresoMensual) * 100;
    const esViable = cuotaMensual <= capacidadPago;

    return {
      es_viable: esViable,
      capacidad_pago: capacidadPago,
      cuota_solicitada: cuotaMensual,
      porcentaje_compromiso: Math.round(porcentajeCompromiso * 100) / 100,
      porcentaje_maximo: porcentajeMax,
      diferencia: Math.round((capacidadPago - cuotaMensual) * 100) / 100
    };
  },

  /**
   * Calcular interés moratorio
   * @param {number} montoCuota - Monto de la cuota vencida
   * @param {number} diasMora - Días de mora
   * @param {number} tasaMoraDiaria - Tasa de mora diaria (porcentaje)
   * @returns {number} - Interés moratorio
   */
  calcularInteresMoratorio(montoCuota, diasMora, tasaMoraDiaria = 0.10) {
    const interesMora = montoCuota * (tasaMoraDiaria / 100) * diasMora;
    return Math.round(interesMora * 100) / 100;
  }
};

module.exports = calculadoraService;
