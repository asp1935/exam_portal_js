initialisation
npx sequelize-cli init

create-migraton-file
npx sequelize-cli migration:generate --name add-cascade-delete-to-taluka


Migration
 npx sequelize-cli db:migrate --config src/config/config.js --migrations-path src/migrations --models-path src/models



 Changes :

 change relation of center and representative