export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Representatives', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      rName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rMobile: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      centerId:{
        type:Sequelize.INTEGER,
        unique: true,
        references:{
          model:'Centers',
          key:'id',
        },
        allowNull:false,
        onDelete:'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    })
  }
}