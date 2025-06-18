import mongoose from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    dob: Date;
    gender: 'male' | 'female';
    image: string;
    age: number;
    isModified(field: string): boolean;
}


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

    age:{
        type: Number,
    },

    image: { type: String },

}, { timestamps: true });

userSchema.pre<IUser>("save", function (next) {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();

    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    this.age = age;
    next();
});



userSchema.pre<IUser>("save", async function (this: IUser, next) {
    if (!this.isModified('password')) return next();

    try {
        const hashed = await bcrypt.hash(this.password, 10);
        this.password = hashed;
        next();
    } catch (err) {
        next(err as Error);
    }

});

export const User = mongoose.model<IUser>("User", userSchema);