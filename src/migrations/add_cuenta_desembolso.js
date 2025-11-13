'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const tableDescription = await queryInterface.describeTable('prestamos');
      
      if (!tableDescription.id_cuenta_desembolso) {
        await queryInterface.addColumn('prestamos', 'id_cuenta_desembolso', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'cuentas',
            key: 'id_cuenta'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        }, { transaction });
      }
      
      if (!tableDescription.frecuencia_pago) {
        await queryInterface.addColumn('prestamos', 'frecuencia_pago', {
          type: Sequelize.ENUM('semanal', 'quincenal', 'mensual'),
          defaultValue: 'mensual'
        }, { transaction });
      }
      
      await transaction.commit();
      console.log('✅ Migración completada');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error);
      throw error;
    }
  }
};
