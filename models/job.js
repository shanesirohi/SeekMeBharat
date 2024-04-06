const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: String, required: true },
    posterName: { type: String, required: true }, // Assuming you want to store the name of the poster
});

module.exports = mongoose.model('Job', jobSchema);
