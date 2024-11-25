import sequelize from './db.js';
import { DataTypes } from 'sequelize';

// Definicja modelu TrainingPlan
export const TrainingPlan = sequelize.define('TrainingPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

// Definicja modelu Workout
export const Workout = sequelize.define('Workout', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    trainingType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    intensity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
});

// Relacje między modelami
TrainingPlan.hasMany(Workout, { foreignKey: 'trainingPlanId', onDelete: 'CASCADE' });
Workout.belongsTo(TrainingPlan, { foreignKey: 'trainingPlanId' });

await sequelize.sync({ alter: true })
    .then(() => console.log('Database synchronized'))
    .catch(err => console.error('Database synchronization error:', err));
