// models/district.js
import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  districtName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export default District;
