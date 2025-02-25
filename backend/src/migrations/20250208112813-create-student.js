export default {
  up: async (queryInterfaec, Sequelize) => {
    await queryInterfaec.createTable('Students', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      schoolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Schools',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      standard: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
          max: 8
        },
        allowNull: false,
      },
      medium: {
        type: Sequelize.ENUM('M', 'S', 'E'),
        allowNull: false,
        defaultValue: 'M',
      },
      fName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobile: {
        type: Sequelize.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
          len: [10, 10]
        }
      },
      examNo: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
      },
      totalMarks: {
        type: Sequelize.INTEGER,
      },
      rank: {
        type: Sequelize.STRING,
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
  down: async (queryInterfaec) => {
    await queryInterfaec.dropTable('Students');
  }
}