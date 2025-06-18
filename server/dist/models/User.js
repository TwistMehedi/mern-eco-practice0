import mongoose from "mongoose";
import bcrypt from "bcrypt";
export const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
    },
    image: { type: String },
}, { timestamps: true });
userSchema.pre("save", function (next) {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
    }
    this.age = age;
    next();
});
userSchema.pre("save", async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const hashed = await bcrypt.hash(this.password, 10);
        this.password = hashed;
        next();
    }
    catch (err) {
        next(err);
    }
});
export const User = mongoose.model("User", userSchema);
