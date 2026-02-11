const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Contract', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    
    // --- ADD THIS NEW FIELD ---
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    // --------------------------

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
    renewalDate: { type: DataTypes.DATEONLY, allowNull: false },
    notes: { type: DataTypes.TEXT },
    owner: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('active', 'cancelled', 'expired'), defaultValue: 'active' },
    attachmentPath: { type: DataTypes.STRING }
  });
};