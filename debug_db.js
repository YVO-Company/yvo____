const mongoose = require('mongoose');

async function debug() {
    try {
        await mongoose.connect('mongodb://localhost:27017/yvo');
        console.log('Connected to DB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const Payment = mongoose.model('Payment', new mongoose.Schema({}, { strict: false }), 'payments');
        const count = await Payment.countDocuments();
        console.log('Total payments in "payments" collection:', count);

        const ModulePayment = mongoose.model('ModulePayment', new mongoose.Schema({}, { strict: false }), 'modulepayments');
        const countOld = await ModulePayment.countDocuments();
        console.log('Total payments in "modulepayments" collection:', countOld);

        const Invoice = mongoose.model('Invoice', new mongoose.Schema({}, { strict: false }), 'invoices');
        const countInv = await Invoice.countDocuments();
        console.log('Total invoices:', countInv);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
