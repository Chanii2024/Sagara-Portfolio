const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Presidential', 'Concerts', 'Portrait', 'Documentary', 'Architectural', 'Nature'],
        default: 'Portrait'
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: String,
    metadata: {
        camera: String,
        lens: String,
        location: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', imageSchema);
