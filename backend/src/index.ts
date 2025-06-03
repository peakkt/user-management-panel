import express from 'express';
import prisma from './prisma';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello, world!');
});

app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.create({ data: { email, password } });
  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
