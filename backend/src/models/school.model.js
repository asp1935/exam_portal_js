import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Center from "./center.model.js";

const School=sequelize.define('School',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    centerId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    schoolName:{
        type:DataTypes.STRING,
        allowNull:false,
    }
});



export default School;