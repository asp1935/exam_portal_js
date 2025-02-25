export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SetA_Results', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      examNo: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        reference:{
          model:'Students',
          key:'examNo'
        }
      },
      marks: {
        type: Sequelize.INTEGER,
      },
      remark: {
        type: Sequelize.ENUM('present', 'absent'),
        defaultValue: 'absent',
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
  down:async(queryInterface)=>{
    await queryInterface.dropTable('SetA_Results');
  }
}