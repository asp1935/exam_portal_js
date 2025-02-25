import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Criteria=sequelize.define('Criterias',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    passingMarks:{
        type:DataTypes.INTEGER,
        defaultValue:0,
    },
    totalMarks:{
        type:DataTypes.INTEGER,
        defaultValue:0,
    },
    stateWiseRank:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    districtWiseRank:{
        type:DataTypes.INTEGER,
        defaultValue:0,
    },
    talukaWiseRank:{
        type:DataTypes.INTEGER,
        defaultValue:0,
    },
    centerWiseRank:{
        type:DataTypes.INTEGER,
        defaultValue:0,
    },

});

export default Criteria;