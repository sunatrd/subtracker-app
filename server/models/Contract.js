// File: server/models/Contract.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Contract', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { 
      type: DataTypes.ENUM('subscription', 'license', 'vendor', 'client'),
      allowNull: false 
    },
    direction: { 
      type: DataTypes.ENUM('expense', 'income'),
      allowNull: false 
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    frequency: { type: DataTypes.ENUM('Monthly', 'Quarterly', 'Yearly', 'One-time'), defaultValue: 'Monthly' },
    startDate: { type: DataTypes.DATEONLY },
    renewalDate: { type: DataTypes.DATEONLY, allowNull: false },
    noticePeriod: { type: DataTypes.INTEGER, defaultValue: 0 },
    isAutoRenew: { type: DataTypes.BOOLEAN, defaultValue: true },
    owner: { type: DataTypes.STRING },
    url: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'cancelled', 'expired'), defaultValue: 'active' },
    attachmentPath: { type: DataTypes.STRING }
  });
};