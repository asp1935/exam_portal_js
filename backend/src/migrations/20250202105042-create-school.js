
export default {
  up:async (queryInterface,Sequelize)=>{
    await queryInterface.createTable('Schools',{
      id:{
        type: Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
      },
      centerId:{
        type:Sequelize.INTEGER,
        references:{
          model:'Centers',
          key:'id',
        },
        allowNull:false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      schoolName:{
        type:Sequelize.STRING,
        allowNull:false,
      },
      createdAt:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.NOW,
      },
      updatedAt:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.NOW
      }
    })
  },
  down:async (queryInterface)=>{
    await queryInterface.dropTable('Schools');
  }
}