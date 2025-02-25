import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import config from './config.js'; 

// dotenv.config({ path: './.env' });

const environment = process.env.NODE_ENV || 'development';

const dbConfig = config[environment];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

console.log(dbConfig.database, dbConfig.username, dbConfig.dialect);

export default sequelize;
