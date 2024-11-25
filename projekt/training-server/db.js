import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('training_planner', 'springstudent', 'springstudent', {
    host: 'localhost',
    dialect: 'mysql',
});

export default sequelize;
