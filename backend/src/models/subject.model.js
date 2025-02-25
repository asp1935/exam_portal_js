import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Subject = sequelize.define('Subject',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    examId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    subName:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    },
    examDate:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    examTime:{
        type:DataTypes.TIME,
        allowNull:false
    }
});

export default Subject;