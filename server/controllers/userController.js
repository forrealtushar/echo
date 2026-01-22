import User from '../models/userModel.js'
import bcrypt from 'bcrypt'

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username already exists", status: false });

        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already exists", status: false });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        });

        // Convert to plain object to safely remove the password
        const userObject = user.toObject();
        delete userObject.password;

        return res.json({ status: true, user: userObject });
    } catch (ex) {
        next(ex);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user)
            return res.json({ msg: "Incorrect Username or Password", status: false });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false });

        // Convert to plain object and fix the 'status' typo
        const userObject = user.toObject();
        delete userObject.password;

        return res.json({ status: true, user: userObject });
    } catch (ex) {
        next(ex);
    }
};

export const getAllUsers = async (req, res, next) => {
  try {
    // This finds every user EXCEPT you (the logged-in user)
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "_id",
      "isOnline",
      "lastSeen"
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};
