import express from 'express'
import loanRouter from './routes/createLoan.js'

const app = express();

app.use(express.json());

app.get('/loan',[body('acc_no').isString().withMessage("Acc no wrong")], loanRouter);

app.get('/', (req, res) => {
    res.send('Loan Service is running');
});

export default app;