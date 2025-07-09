const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    set: {
        type: Number,
        required: [true, 'Set number is required'],
        min: [1, 'Set number must be at least 1'],
        max: [52, 'Set number cannot exceed 52'],
        index: true
    },
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        minlength: [10, 'Question must be at least 10 characters long']
    },
    options: {
        a: {
            type: String,
            required: [true, 'Option A is required'],
            trim: true
        },
        b: {
            type: String,
            required: [true, 'Option B is required'],
            trim: true
        },
        c: {
            type: String,
            required: [true, 'Option C is required'],
            trim: true
        },
        d: {
            type: String,
            required: [true, 'Option D is required'],
            trim: true
        }
    },
    correctOption: {
        type: String,
        required: [true, 'Correct option is required'],
        enum: {
            values: ["a", "b", "c", "d"],
            message: 'Correct option must be a, b, c, or d'
        },
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Question type is required'],
        enum: {
            values: ["technical", "non-technical"],
            message: 'Type must be either technical or non-technical'
        },
        lowercase: true,
        trim: true
    },
    explanation: {
        type: String,
        default: "",
        trim: true
    },
    difficulty: {
        type: String,
        enum: {
            values: ["easy", "medium", "hard"],
            message: 'Difficulty must be easy, medium, or hard'
        },
        default: "medium"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
questionSchema.index({ set: 1, type: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ question: 'text' });

// Pre-save hook to validate options
questionSchema.pre('save', function (next) {
    const options = this.options;
    if (!options.a || !options.b || !options.c || !options.d) {
        throw new Error('All options (a, b, c, d) are required');
    }
    next();
});

module.exports = mongoose.model("Question", questionSchema);