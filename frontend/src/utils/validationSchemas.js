import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "Too short"),
  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Too short"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .test(
      "password-strength",
      function (value) {
        if (!value) return false; // already handled by required()
        const errors = [];
        if (!/[A-Z]/.test(value)) errors.push("an uppercase letter");
        if (!/[a-z]/.test(value)) errors.push("a lowercase letter");
        if (!/[0-9]/.test(value)) errors.push("a number");
        if (!/[\W_]/.test(value)) errors.push("a special character");
        if (errors.length > 0) {
          return this.createError({
            message: `Password must contain ${errors.join(", ")}`,
          });
        }
        return true;
      }
    ),
  role: Yup.string()
    .required("Please select a role")
    .oneOf(['admin', 'player', 'agent'], "Invalid role. Must be 'admin', 'player', or 'agent'"),
});
