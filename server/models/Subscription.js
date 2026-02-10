const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING, // 'Subscription', 'License', 'Vendor', 'Client'
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    frequency: {
      type: DataTypes.STRING, // 'Monthly', 'Yearly'
      defaultValue: 'Monthly'
    },
    startDate: {
      type: DataTypes.DATEONLY
    },
    renewalDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Active' // Active, Cancelled
    },
    url: {
      type: DataTypes.STRING
    }
  });

  return Subscription;
};