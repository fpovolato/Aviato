const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Airline', airlineSchema);