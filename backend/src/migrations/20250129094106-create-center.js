// migrations/<timestamp>-create-taluka-table.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Centers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      centerName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      talukaId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Talukas', // the table to reference
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',  // This will ensure that deleting a District will delete associated Taluka
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Centers');
  }
}
