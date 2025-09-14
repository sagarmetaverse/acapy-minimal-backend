import express from 'express';
import morgan from 'morgan';
import acapyRouter from './routes/acapy.route';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Acao-Py Minimal Backend');
});

app.use('/api/acapy', acapyRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
