import { Sequelize } from "sequelize";
import { sequelizeConfig } from "./config/database.js";
import defineUserModel from "./models/User.js";
import defineCycleModel from "./models/Cycle.js";
import defineCycleStepModel from "./models/CycleStep.js";
import defineCategoryModel from "./models/Category.js";
import defineClassLevelModel from "./models/ClassLevel.js";
import defineQuickFactModel from "./models/QuickFact.js";
import defineActivityLogModel from "./models/ActivityLog.js";

let sequelize;

// allow using a full connection string (DATABASE_URL) or separate params
if (sequelizeConfig.url) {
  sequelize = new Sequelize(sequelizeConfig.url, {
    dialect: sequelizeConfig.dialect,
    ssl: sequelizeConfig.ssl,
    dialectOptions: sequelizeConfig.dialectOptions,
    logging: sequelizeConfig.logging,
  });
} else {
  sequelize = new Sequelize(
    sequelizeConfig.database,
    sequelizeConfig.username,
    sequelizeConfig.password,
    {
      host: sequelizeConfig.host,
      port: sequelizeConfig.port,
      dialect: sequelizeConfig.dialect,
      ssl: sequelizeConfig.ssl,
      dialectOptions: sequelizeConfig.dialectOptions,
      logging: sequelizeConfig.logging,
    },
  );
}

// Define Models
const User = defineUserModel(sequelize);
const Cycle = defineCycleModel(sequelize);
const CycleStep = defineCycleStepModel(sequelize);
const Category = defineCategoryModel(sequelize);
const ClassLevel = defineClassLevelModel(sequelize);
const QuickFact = defineQuickFactModel(sequelize);
const ActivityLog = defineActivityLogModel(sequelize);

// Setup Relationships
User.hasMany(Cycle, { foreignKey: "createdBy", as: "createdCycles" });
User.hasMany(Cycle, { foreignKey: "updatedBy", as: "updatedCycles" });
Cycle.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Cycle.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Category.hasMany(Cycle, { foreignKey: "categoryId", as: "cycles" });
Cycle.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

ClassLevel.hasMany(Cycle, { foreignKey: "classLevelId", as: "cycles" });
Cycle.belongsTo(ClassLevel, { foreignKey: "classLevelId", as: "classLevel" });

Cycle.hasMany(CycleStep, { foreignKey: "cycleId", as: "steps" });
CycleStep.belongsTo(Cycle, { foreignKey: "cycleId" });

Cycle.hasMany(QuickFact, { foreignKey: "cycleId", as: "quickFacts" });
QuickFact.belongsTo(Cycle, { foreignKey: "cycleId" });

User.hasMany(ActivityLog, { foreignKey: "userId", as: "activities" });
ActivityLog.belongsTo(User, { foreignKey: "userId" });

export {
  sequelize,
  User,
  Cycle,
  CycleStep,
  Category,
  ClassLevel,
  QuickFact,
  ActivityLog,
};
