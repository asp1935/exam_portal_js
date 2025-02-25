import { app } from "./app.js";
import {  associateModels } from "./config/associateModel.js";
import sequelize from "./config/db.js";

async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkConnection().then(() => {
  associateModels();
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is Running at port:${process.env.PORT || 8000}`);
  })
})
  .catch((err) => {
    console.log('MONGODB Connection Failed !!!', err);
  })
