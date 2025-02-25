import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        index: true,
    },
    standard: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 8
        },
        allowNull: false,
        index: true,
    },
    medium: {
        type: DataTypes.ENUM('M', 'S', 'E'),
        allowNull: false,
        defaultValue: 'M',
        validate: {
            isIn: {
                args: [['M', 'S', 'E']],
                msg: "Medium must be one of 'M', 'S', or 'E'"
            }
        }
    },
    fName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 10]
        }
    },
    examNo: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
    totalMarks: {
        type: DataTypes.INTEGER,
    },
    rank: {
        type: DataTypes.STRING,
    }

})

export default Student;