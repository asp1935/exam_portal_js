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
        // references:{
        //     model:Center,
        //     key:'id'
        // },
        allowNull:false
    },
    schoolName:{
        type:DataTypes.STRING,
        allowNull:false,
    }
});
// School.belongsTo(Center,{
//     foreignKey:"centerId",
//     as:"center",
//     onDelete:'CASCADE',
// });


export default School;