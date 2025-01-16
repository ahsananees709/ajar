import jwt from "jsonwebtoken"
import { JWT_PRIVATE_KEY, JWT_ACCESS_EXPIRATION_TIME, JWT_REFRESH_EXPIRATION_TIME } from "./constant.js"
import { database } from "../../db/db.js";
import { eq } from "drizzle-orm"

const createOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const createJWTToken = async (payload) => {
  try {
    const accessToken = await jwt.sign(
      { id: payload, tokenType:"access" },
      JWT_PRIVATE_KEY,
      { expiresIn: JWT_ACCESS_EXPIRATION_TIME }
    );

    const refreshToken = await jwt.sign(
      { id: payload, tokenType:"refresh"  },
      JWT_PRIVATE_KEY,
      { expiresIn: JWT_REFRESH_EXPIRATION_TIME } 
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error.message);
    throw new Error("Token generation failed");
  }
};


const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_PRIVATE_KEY);
  } catch (error) {
    // Check for token expiration error
    if (error.name === "TokenExpiredError") {
      throw new Error("TokenExpiredError");
    }
    // Check for other token-related errors (e.g., invalid signature, malformed token)
    if (error.name === "JsonWebTokenError") {
      throw new Error("InvalidTokenError");
    }
    throw new Error("TokenVerificationError");
  }
};


function getToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    // console.log({tokenwithbearer:req.headers.authorization,token: req.headers.authorization.split(" ")[1]});
    return req.headers.authorization.split(" ")[1]
  }
  return null
}

function generateRandomPassword() {
  const length = 8;
  
  // Character sets
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";
  
  // Ensuring at least one of each required type
  let password = "";
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Combine all sets for the remaining characters
  const allChars = lowerCase + upperCase + numbers + specialChars;

  // Fill the rest of the password length
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to randomize character order
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}


function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;

  const sumOfRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = sumOfRatings / reviews.length;
  return averageRating;
}

function calculateProfileCompletion(user) {
  
  const fields = [
    'email',
    'phone',
    'password',
    'first_name',
    'last_name',
    'gender',
    'profile_picture',
    'cnic',
    'address',
    'driving_license_details'
  ];

  const totalFields = fields.length;
  let completedFields = 0;

  fields.forEach(field => {
    if (user[field] && user[field].toString().trim() !== '') {
      completedFields++;
    }
  });

  const percentage = (completedFields / totalFields) * 100;
  const roundedPercentage = Math.round(percentage * 100) / 100;

  return roundedPercentage;
}


export { createOTP,createJWTToken,getToken,verifyToken,generateRandomPassword, calculateProfileCompletion, calculateAverageRating}
