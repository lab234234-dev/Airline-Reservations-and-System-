const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'agent'], default: 'user' },
  profilePic: { type: String, default: '' },
  phone: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  idType: { type: String, enum: ['Aadhaar', 'Passport', 'National ID', 'Other', ''], default: '' },
  idNumber: { type: String, default: '' },
  seatPreference: { type: String, enum: ['Window', 'Aisle', 'Extra Legroom', 'Any', ''], default: 'Window' },
  mealPreference: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Jain Meal', 'Vegan', 'None', ''], default: 'Vegetarian' },
  rewardPoints: { type: Number, default: 250 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
