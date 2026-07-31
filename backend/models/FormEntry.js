const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const FormEntry = sequelize.define(
  "FormEntry",
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assistant: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "form_entries",
    timestamps: false, // matches the original schema (only submittedAt was tracked)
  }
);

// Relationship: one User has many FormEntry rows.
// constraints: false keeps this soft (Google/guest users, forms with no userId, etc.)
FormEntry.belongsTo(User, { foreignKey: "userId", constraints: false });
User.hasMany(FormEntry, { foreignKey: "userId", constraints: false });

module.exports = FormEntry;
