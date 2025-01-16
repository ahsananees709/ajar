import { z } from "zod"

const passwordContainsMixture = value => {
  if (typeof value !== "string") return false;

  // Regex to enforce:
  // - At least 1 uppercase letter
  // - At least 1 lowercase letter
  // - At least 1 digit
  // - At least 1 special character
  // - Minimum length of 8 characters
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  return passwordRegex.test(value);
};

const registerUserValidationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  last_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
    email: z.string().trim().min(1).email(),
    phone: z.string().trim().min(11).max(15).regex(/^\+\d+$/),
    password: z
    .string()
    .trim()
    .min(8)
    .refine(passwordContainsMixture, {
      message:
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
    }),
})

const verifyAccountValidationSchema = z.object({
  email: z.string().min(1).email(),
  otp: z.string().min(6).max(7),
})

const verifyOTPValidationSchema = z.object({
  email: z.string().min(1).email(),
  otp: z.string().min(6).max(7),
})

const getNewOTPValidationSchema = z.object({
  email: z.string().min(1).email(),
})

const loginUserValidationSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
})

const updatePasswordValidationSchema = z
  .object({
    oldPassword: z.string().min(8),
    newPassword: z.string()
    .trim()
    .min(8)
    .refine(passwordContainsMixture, {
      message:
        "New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
    }),
  })
  .refine(data => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the old password",
  })

const resetPasswordValidationSchema = z.object({
  email: z.string().email().min(1),
  newPassword: z.string()
    .trim()
    .min(8)
    .refine(passwordContainsMixture, {
      message:
        "New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
    }),
})

const completeProfileValidationSchema = z.object({
  cnic: z.string().regex(/^\d{5}\d{7}\d$/, {
    message: "cnic in '1234512345671' format",
  }),
  gender: z.enum(["male", "female", "other"]),
  address: z.object({
    street_no: z.number({ message: "street_no should be a positive number" }).min(0, { message: "street_no should be a positive number" }),
    city: z
      .string()
      .min(1)
      .regex(/^[A-Za-z\s]+$/, { message: "City must be a string of characters" }),
    state: z
      .string()
      .min(1)
      .regex(/^[A-Za-z\s]+$/, { message: "State must be a string of characters" }),
    postal_code: z.string().min(1).regex(/^\d+$/, { message: "Postal Code must be a string of numbers" }),
    country: z
      .string()
      .min(1)
      .regex(/^[A-Za-z\s]+$/, { message: "Country must be a string of characters" }),
  }),
})

const updateUserValidationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/, { message: "Only alphabets are allow!" })
    .optional(),
  last_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/)
    .optional(),
  cnic: z.string().regex(/^\d{5}\d{7}\d$/, {
    message: "cnic should be in '1234512345671' format",
  }).optional(),
  address: z
    .object({
      street_no: z
        .number({ message: "street_no should be a positive number" })
        .min(0, { message: "street_no should be a positive number" }),
      city: z
        .string()
        .min(1)
        .regex(/^[A-Za-z\s]+$/, { message: "City must be a string of characters" }),
      state: z
        .string()
        .min(1)
        .regex(/^[A-Za-z\s]+$/, { message: "State must be a string of characters" }),
      postal_code: z.string().min(1).regex(/^\d+$/, { message: "Postal Code must be a string of numbers" }),
      country: z
        .string()
        .min(1)
        .regex(/^[A-Za-z\s]+$/, { message: "Country must be a string of characters" }),
      location: z.string().optional(),
    })
    .optional(),
  phone: z.string().trim().min(11).max(15).regex(/^\d+$/).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
})

const licenseDetailsValidationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/, { message: "Only alphabets are allowed!" }),
  middle_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/, { message: "Only alphabets are allowed!" })
    .optional(),
  last_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  country: z
    .string()
    .min(1)
    .regex(/^[A-Za-z\s]+$/, { message: "Country must be a string of characters" }),
  state: z
    .string()
    .min(1)
    .regex(/^[A-Za-z\s]+$/, { message: "State must be a string of characters" }),
  license_number: z
    .string()
    .trim()
    .min(1),
  date_of_birth: z
    .string()
    .refine((dob) => {
      const parsedDob = new Date(dob);
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return !isNaN(parsedDob) && parsedDob <= minAge;
    }, {
      message: "You must be at least 18 years old.",
    }),
  expiration_date: z
    .string()
    .refine((exp) => {
      const parsedExp = new Date(exp); 
      return !isNaN(parsedExp) && parsedExp > new Date(); 
    }, {
      message: "Expiration date must be in the future.",
    })
});




export {
  registerUserValidationSchema,
  verifyAccountValidationSchema,
  getNewOTPValidationSchema,
  loginUserValidationSchema,
  updatePasswordValidationSchema,
  resetPasswordValidationSchema,
  completeProfileValidationSchema,
  updateUserValidationSchema,
  verifyOTPValidationSchema,
  licenseDetailsValidationSchema
}