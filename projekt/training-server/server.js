import express from 'express';
import cors from 'cors';
import { TrainingPlan, Workout } from './models.js';

const app = express();
const PORT = 7777;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Training Planner API with MySQL');
});

app.get('/plans', async (req, res) => {
    try {
        const plans = await TrainingPlan.findAll({ include: Workout });
        res.json(plans);
    } catch (err) {
        console.error("Error fetching plans:", err);
        res.status(500).send('Could not fetch plans');
    }
});

app.post('/plans', async (req, res) => {
    const { name, startDate, endDate, workouts } = req.body;

    if (!name || !startDate || !endDate) {
        return res.status(400).send('Missing required fields: name, startDate, endDate');
    }

    try {
        const plan = await TrainingPlan.create({ name, startDate, endDate });
        if (workouts && workouts.length > 0) {
            await Workout.bulkCreate(workouts.map(workout => ({ ...workout, trainingPlanId: plan.id })));
        }
        res.status(201).json(plan);
    } catch (err) {
        console.error("Error creating plan:", err);
        res.status(500).send('Could not save plan');
    }
});

app.post('/plans/:id/workouts', async (req, res) => {
    const { id } = req.params;
    const { date, trainingType, duration, intensity, description } = req.body;

    if (!date || !trainingType || !duration || !intensity) {
        return res.status(400).send('Missing required fields: date, trainingType, duration, intensity');
    }

    try {
        const plan = await TrainingPlan.findByPk(id);
        if (!plan) {
            return res.status(404).send('Plan not found');
        }

        const workout = await Workout.create({ date, trainingType, duration, intensity, description, trainingPlanId: id });
        res.status(201).json(workout);
    } catch (err) {
        console.error("Error adding workout:", err);
        res.status(500).send('Could not save workout');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
