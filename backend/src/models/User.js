import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

export const defineUserModel = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        lowercase: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("super_admin", "admin", "editor", "viewer"),
        defaultValue: "editor",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "pending"),
        defaultValue: "pending",
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lockoutUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastFailedLogin: {
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
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
      timestamps: true,
    },
  );

  User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  // Check if account is locked due to failed attempts
  User.prototype.isAccountLocked = function () {
    if (!this.lockoutUntil) return false;
    return new Date() < this.lockoutUntil;
  };

  // Record a failed login attempt
  User.prototype.recordFailedLogin = async function () {
    const newFailedAttempts = (this.failedLoginAttempts || 0) + 1;
    const updates = {
      failedLoginAttempts: newFailedAttempts,
      lastFailedLogin: new Date(),
    };

    // Lock account after 5 failed attempts for 30 minutes
    if (newFailedAttempts >= 5) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 30);
      updates.lockoutUntil = lockoutTime;
    }

    await this.update(updates);
  };

  // Reset failed login attempts after successful login
  User.prototype.resetLoginAttempts = async function () {
    await this.update({
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastFailedLogin: null,
    });
  };

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  return User;
};

export default defineUserModel;
