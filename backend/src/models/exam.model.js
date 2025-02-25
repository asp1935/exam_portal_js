import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Exam=sequelize.define('Exam',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    examName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    logoUrl:{
        type:DataTypes.STRING,
        allowNull:false
    },
    signPngUrl:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    hallTicketNote:{
        type:DataTypes.STRING,
    },
    certificateNote:{
        type:DataTypes.STRING,
    },
    examDate:{
        type:DataTypes.DATEONLY
    },
    resultDate:{
        type:DataTypes.DATEONLY
    }
});

export default Exam;