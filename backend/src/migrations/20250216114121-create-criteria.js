export default {
  up: async (QueryInterface, Sequelize) => {
    await QueryInterface.createTable('Criterias', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      passingMarks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalMarks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      stateWiseRank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      districtWiseRank: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      talukaWiseRank: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      centerWiseRank: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('Criterias')
  }
}