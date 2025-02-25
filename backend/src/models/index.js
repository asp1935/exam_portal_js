// import fs from 'fs';
// import path from 'path';
// import Sequelize from 'sequelize';
// import { fileURLToPath } from 'url';

// // Get the current file's path and directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = (await import(path.join(__dirname, '/../config/config.js'))).default[env];
// const db = {};

// const sequelize = new Sequelize(config.database, config.username, config.password, config);

// fs.readdirSync(__dirname)
//   .filter(file => {
//     return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
//   })
//   .forEach(async file => {
//     const model = (await import(path.join(__dirname, file))).default(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// export default db;
