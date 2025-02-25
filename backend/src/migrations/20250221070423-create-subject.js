
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Subjects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      examId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      examDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      examTime: {
        type: Sequelize.TIME,
        allowNull: false
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
    await queryInterface.dropTable('Subjects');
  }
}