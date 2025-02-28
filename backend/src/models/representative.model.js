import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Center from "./center.model.js"
const Representative=sequelize.define('Representative',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    rName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    rMobile:{
        type:DataTypes.BIGINT,
        allowNull:false,
    },
    centerId:{
        type:DataTypes.INTEGER,
        unique:true,
        // references:{
        //     model:Center,
        //     key:'id'
        // },
        allowNull:false
    },
});

// Representative.belongsTo(Center,{
//     foreignKey:'centerId',
//     as:'center',
//     onDelete:'CASCADE'
// })

export default Representative;