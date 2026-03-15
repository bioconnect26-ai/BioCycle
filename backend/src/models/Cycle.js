import { DataTypes } from "sequelize";

export const defineCycleModel = (sequelize) => {
  const Cycle = sequelize.define(
    "Cycle",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      classLevelId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      simulationUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      simulationAttribution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM("draft", "pending_review", "published"),
        defaultValue: "draft",
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    },
  );

  return Cycle;
};

export default defineCycleModel;
