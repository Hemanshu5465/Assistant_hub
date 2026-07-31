const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // null for Google-only accounts
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  },
  {
    tableName: "users",
    timestamps: true, // adds createdAt / updatedAt, same as the old Mongoose schema
  }
);

module.exports = User;
