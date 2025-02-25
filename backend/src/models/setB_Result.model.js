import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SetB_Result=sequelize.define('SetB_Result',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    examNo:{
        type:DataTypes.INTEGER,
        unique:true,
        allowNull:false,
    },
    marks:{
        type:DataTypes.INTEGER,
    },
    remark:{
        type:DataTypes.ENUM('present','absent'),
        defaultValue:'absent',
        allowNull:false
    }
},
// {timestamps:false}
);
export default SetB_Result;