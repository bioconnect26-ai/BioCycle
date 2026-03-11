import { DataTypes } from "sequelize";

export const defineFlashcardModel = (sequelize) => {
  const Flashcard = sequelize.define(
    "Flashcard",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      cycleId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      frontTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frontDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      backDetail: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      memoryTrick: {
        type: DataTypes.TEXT,
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

  return Flashcard;
};

export default defineFlashcardModel;
