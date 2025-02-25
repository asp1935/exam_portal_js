
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Exams', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      examName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      signPngUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hallTicketNote: {
        type: Sequelize.STRING,
      },
      certificateNote: {
        type: Sequelize.STRING,
      },
      examDate:{
        type: Sequelize.DATEONLY,
      },
      resultDate:{
        type: Sequelize.DATEONLY,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Exams');
  }
}