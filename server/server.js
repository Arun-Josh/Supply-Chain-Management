const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// const WEBSITE_URL = 'http://localhost:5050';
// const WEBSITE_URL = 'git s://supplymanager.herokuapp.com';

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5050;
// const PORT = 5050;

//Deployment task
// app.use(cors({ credentials: true, origin: WEBSITE_URL }));
app.use(express.json());

const uri =  process.env.ATLAS_URI

const options = {
    autoIndex: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

mongoose.connect(uri, options).catch(error => console.log((error)));

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
    console.log('MongoDB Connection established successfully !')
});

//Routes
const adminsRouter = require('./routes/Admins.js')
const consumersRouter = require('./routes/Consumers.js')
const suppliersRouter = require('./routes/Suppliers.js')
const paymentsRouter = require('./routes/Payments.js')
const commoditiesRouter = require('./routes/Commodities.js')
const transactionsRouter = require('./routes/Transactions.js')
const salesRouter = require('./routes/Sales.js')
const purchasesRouter = require('./routes/Purchases.js')
const salesReturnsRouter = require('./routes/SalesReturns')
const purchaseReturnsRouter = require('./routes/PurchaseReturns')
const expensesRouter = require('./routes/Expenses.js')
const incomesRouter = require('./routes/Incomes.js')
const usersRouter = require('./routes/Users')
const accountTransactionsRouter = require('./routes/AccountTransactions.js')

app.use('/api/admins', adminsRouter);
app.use('/api/consumers', consumersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/commodities', commoditiesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/sales-returns', salesReturnsRouter);
app.use('/api/purchase-returns', purchaseReturnsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/incomes', incomesRouter);
app.use('/api/users', usersRouter)
app.use('/api/statements', accountTransactionsRouter)

const path = require('path');
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get('*', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Service is running on Port: ${PORT}`)
});
