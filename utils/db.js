const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const uri = "mongodb+srv://shreyasdhale7249:pB7RwrQc8o9tAHcv@cluster0.vph7pc9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
    await mongoose.connect(uri);
    console.log("Connected to the collection users");

    if (!mongoose.models.User) {
        const userSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
                trim: true
            },
            age: {
                type: Number,
                required: true,
                trim: true,
                validate(value) {
                    if (value < 0) {
                        throw new Error("Age must not be negative");
                    }
                }
            },
            email: {
                type: String,
                trim: true,
                required: true,
                unique: true,
                validate(value) {
                    if (!validator.isEmail(value)) {
                        throw new Error("Not in the format of email");
                    }
                }
            },
            password: {
                type: String,
                required: true,
                minlength: 5,
            },
            tokens: [
                {
                    type: String,
                    required: true
                }
            ]
        });

        userSchema.methods.toJSON = function () {
            const user = this.toObject()
            delete user.password
            delete user.tokens
            return user;
        };

        userSchema.statics.findByCredential = async (email, password) => {
            try {
                const user = await User.findOne({ email })
                if (!user) throw new Error("User not found")
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch)
                    throw new Error("Invalid Credentials");
                return user;
            } catch (e) {
                return "Cannot login";
            }
        };

        userSchema.methods.generateAuthToken = async function () {
            const user = this
            const token = await jwt.sign({ _id: user._id.toString() }, 'thisismyprivatekey')
            user.tokens = user.tokens.concat(token)
            await user.save()
            return token
        };

        userSchema.pre('save', async function (next) {
            const user = this;
            if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8);
            next();
        });

        mongoose.model('User', userSchema);
    }

    return mongoose.model('User');
}

module.exports = main;


