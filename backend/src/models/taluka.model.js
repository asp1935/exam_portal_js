// models/taluka.js

import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import District from "./district.model.js";


const Taluka = sequelize.define('Taluka', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    talukaName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    districtId: {
        type: DataTypes.INTEGER,
        // references: {
        //     model: District,
        //     key: 'id'
        // },
        allowNull: false
    },
});

// return Taluka;
// };

// Define the association
// Taluka.belongsTo(District,{
//     foreignKey:'districtId',
//     as:'district', 
//     onDelete: 'CASCADE',  
// })

export default Taluka;
