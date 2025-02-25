import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Taluka from "./taluka.model.js";
// import School from "./school.model.js";
// import Representative from "./representative.model.js";

const Center=sequelize.define("Center",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    talukaId:{
        type:DataTypes.INTEGER,
        // references:{
        //     model:Taluka,
        //     key:'id'
        // },
        allowNull:false
    },
    centerName:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    }
})

Center.belongsTo(Taluka,{
    foreignKey:"talukaId",
    as:'taluka',
    onDelete: 'CASCADE',  // Automatically delete the taluka if the associated district is deleted
});
// Center.hasMany(School,{
//     foreignKey:'centerId',
//     as:'schools',
//     onDelete:'CASCADE'
// })
// Center.hasOne(Representative,{
//     foreignKey:'centerId',
//     as:'representative',
//     onDelete:'CASCADE'
// })

export default Center;