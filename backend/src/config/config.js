import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

export default{
  developement: {
    username: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME ,
    host: process.env.DB_HOST ,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306
  },
  production: {
    username: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME ,
    host: process.env.DB_HOST ,
    dialect: process.env.DB_DIALECT ,
    port: process.env.DB_PORT ,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
