import express from 'express';
import cors from 'cors';
import { TrainingPlan, Workout } from './models.js';
import { Op } from 'sequelize';

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
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
        return res.status(400).send('Missing required fields: name, startDate, endDate');
    }

    try {
        const plan = await TrainingPlan.create({ name, startDate, endDate });
        res.status(201).json(plan);
    } catch (err) {
        console.error("Error creating plan:", err);
        res.status(500).send('Could not save plan');
    }
});


app.post('/workouts', async (req, res) => {
    const { trainingPlanId, date, trainingType, duration, intensity, description } = req.body;

    if (!trainingPlanId || !date || !trainingType || !duration || !intensity) {
        return res.status(400).send('Missing required fields: trainingPlanId, date, trainingType, duration, intensity');
    }

    try {
        const plan = await TrainingPlan.findByPk(trainingPlanId);
        if (!plan) {
            return res.status(404).send('Training plan not found');
        }

        const workout = await Workout.create({ date, trainingType, duration, intensity, description, trainingPlanId });
        res.status(201).json(workout);
    } catch (err) {
        console.error("Error adding workout:", err);
        res.status(500).send('Could not save workout');
    }
});

app.get('/plans/active', async (req, res) => {
    try {
      const today = new Date();
      const activePlans = await TrainingPlan.findAll({
        where: {
          endDate: { [Op.gte]: today },
        },
      });
      res.json(activePlans);
    } catch (err) {
      console.error('Error fetching active plans:', err);
      res.status(500).send('Could not fetch active plans');
    }
});
  
app.get('/plans/:id', async (req, res) => {
  const { id } = req.params; // Pobieramy id z parametrów URL

  try {
      // Szukamy planu treningowego o konkretnym id
      const plan = await TrainingPlan.findByPk(id, {
          include: Workout // Dołączamy workouty do planu
      });

      // Jeśli plan nie istnieje, zwracamy błąd 404
      if (!plan) {
          return res.status(404).send('Training plan not found');
      }

      // Jeśli plan istnieje, zwracamy go wraz z jego workoutami
      res.status(200).json(plan);
  } catch (err) {
      console.error('Error fetching plan:', err);
      res.status(500).send('Could not fetch plan');
  }
});

app.get('/plans/:planId/workouts/:workoutId', async (req, res) => {
  const { planId, workoutId } = req.params; // Pobieramy planId i workoutId z parametrów URL

  try {
      // Szukamy planu na podstawie planId
      const plan = await TrainingPlan.findByPk(planId);

      if (!plan) {
          return res.status(404).send('Training plan not found');
      }

      // Szukamy workoutu na podstawie workoutId i związania z planem
      const workout = await Workout.findOne({
          where: {
              id: workoutId,
              trainingPlanId: planId // Upewniamy się, że workout należy do tego planu
          }
      });

      if (!workout) {
          return res.status(404).send('Workout not found for this plan');
      }

      // Jeśli workout istnieje, zwracamy go
      res.status(200).json(workout);
  } catch (err) {
      console.error('Error fetching workout:', err);
      res.status(500).send('Could not fetch workout');
  }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
