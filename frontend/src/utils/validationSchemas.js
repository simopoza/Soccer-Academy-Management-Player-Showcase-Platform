// // import * as Yup from "yup";

// // export const registerSchema = Yup.object().shape({
// //   first_name: Yup.string()
// //     .required("First name is required")
// //     .min(2, "Too short"),
// //   last_name: Yup.string()
// //     .required("Last name is required")
// //     .min(2, "Too short"),
// //   email: Yup.string()
// //     .required("Email is required")
// //     .email("Invalid email format"),
// //   password: Yup.string()
// //     .required("Password is required")
// //     .min(8, "Password must be at least 8 characters")
// //     .test(
// //       "password-strength",
// //       function (value) {
// //         if (!value) return false; // already handled by required()
// //         const errors = [];
// //         if (!/[A-Z]/.test(value)) errors.push("an uppercase letter");
// //         if (!/[a-z]/.test(value)) errors.push("a lowercase letter");
// //         if (!/[0-9]/.test(value)) errors.push("a number");
// //         if (!/[\W_]/.test(value)) errors.push("a special character");
// //         if (errors.length > 0) {
// //           return this.createError({
// //             message: `Password must contain ${errors.join(", ")}`,
// //           });
// //         }
// //         return true;
// //       }
// //     ),
// //   role: Yup.string()
// //     .required("Please select a role")
// //     .oneOf(['admin', 'player', 'agent'], "Invalid role. Must be 'admin', 'player', or 'agent'"),
// // });

// // import * as Yup from "yup";
// // import i18n from "../i18n"; // <-- make sure path is correct
// // const t = i18n.t.bind(i18n);

// // export const registerSchema = Yup.object().shape({
// //   first_name: Yup.string()
// //     .required(t("errors.firstNameRequired"))
// //     .min(2, t("errors.nameTooShort")),

// //   last_name: Yup.string()
// //     .required(t("errors.lastNameRequired"))
// //     .min(2, t("errors.nameTooShort")),

// //   email: Yup.string()
// //     .required(t("errors.emailRequired"))
// //     .email(t("errors.invalidEmail")),

// //   password: Yup.string()
// //     .required(t("errors.passwordRequired"))
// //     .min(8, t("errors.passwordMin"))
// //     .test("password-strength", function (value) {
// //       if (!value) return false;

// //       const missing = [];

// //       if (!/[A-Z]/.test(value)) missing.push(t("errors.uppercaseRequired"));
// //       if (!/[a-z]/.test(value)) missing.push(t("errors.lowercaseRequired"));
// //       if (!/[0-9]/.test(value)) missing.push(t("errors.numberRequired"));
// //       if (!/[\W_]/.test(value)) missing.push(t("errors.specialCharRequired"));

// //       if (missing.length > 0) {
// //         return this.createError({
// //           message: t("errors.passwordStrength", { rules: missing.join(", ") })
// //         });
// //       }

// //       return true;
// //     }),

// //   role: Yup.string()
// //     .required(t("errors.roleRequired"))
// //     .oneOf(["admin", "player", "agent"], t("errors.invalidRole")),
// // });

// // import * as Yup from "yup";
// // import  i18n  from "../i18n"; // or however you import i18n

// // export const registerSchema = Yup.object().shape({
// //   first_name: Yup.string()
// //     .required(i18n.t("errors.firstNameRequired"))
// //     .min(2, i18n.t("errors.nameTooShort")),

// //   last_name: Yup.string()
// //     .required(i18n.t("errors.lastNameRequired"))
// //     .min(2, i18n.t("errors.nameTooShort")),

// //   email: Yup.string()
// //     .required(i18n.t("errors.emailRequired"))
// //     .email(i18n.t("errors.invalidEmail")),

// //   password: Yup.string()
// //     .required(i18n.t("errors.passwordRequired"))
// //     .min(8, i18n.t("errors.passwordMin"))
// //     .test("password-strength", function (value) {
// //       if (!value) return false;

// //       const missingRules = [];
// //       if (!/[A-Z]/.test(value)) missingRules.push(i18n.t("errors.uppercaseRequired"));
// //       if (!/[a-z]/.test(value)) missingRules.push(i18n.t("errors.lowercaseRequired"));
// //       if (!/[0-9]/.test(value)) missingRules.push(i18n.t("errors.numberRequired"));
// //       if (!/[\W_]/.test(value)) missingRules.push(i18n.t("errors.specialCharRequired"));

// //       if (missingRules.length > 0) {
// //         return this.createError({
// //           message: i18n.t("errors.passwordStrength", {
// //             rules: missingRules.join("، ")
// //           })
// //         });
// //       }
// //       return true;
// //     }),

// //   role: Yup.string()
// //     .required(i18n.t("errors.roleRequired"))
// //     .oneOf(["admin", "player", "agent"], i18n.t("errors.invalidRole"))
// // });


// import * as Yup from "yup";

// export const registerSchema = (i18n) =>
//   Yup.object().shape({
//     first_name: Yup.string()
//       .required(i18n.t("errors.firstNameRequired"))
//       .min(2, i18n.t("errors.nameTooShort")),

//     last_name: Yup.string()
//       .required(i18n.t("errors.lastNameRequired"))
//       .min(2, i18n.t("errors.nameTooShort")),

//     email: Yup.string()
//       .required(i18n.t("errors.emailRequired"))
//       .email(i18n.t("errors.invalidEmail")),

//     password: Yup.string()
//       .required(i18n.t("errors.passwordRequired"))
//       .min(8, i18n.t("errors.passwordMin"))
//       .test("password-strength", function (value) {
//         if (!value) return false;

//         const missingRules = [];
//         if (!/[A-Z]/.test(value)) missingRules.push(i18n.t("errors.uppercaseRequired"));
//         if (!/[a-z]/.test(value)) missingRules.push(i18n.t("errors.lowercaseRequired"));
//         if (!/[0-9]/.test(value)) missingRules.push(i18n.t("errors.numberRequired"));
//         if (!/[\W_]/.test(value)) missingRules.push(i18n.t("errors.specialCharRequired"));

//         if (missingRules.length > 0) {
//           return this.createError({
//             message: i18n.t("errors.passwordStrength", {
//               rules: missingRules.join("، ")
//             })
//           });
//         }
//         return true;
//       }),

//     role: Yup.string()
//       .required(i18n.t("errors.roleRequired"))
//       .oneOf(["admin", "player", "agent"], i18n.t("errors.invalidRole"))
//   });


import * as Yup from "yup";

export const registerSchema = (i18n) =>
  Yup.object().shape({
    first_name: Yup.string()
      .required(i18n.t("errors.firstNameRequired"))
      .min(2, i18n.t("errors.nameTooShort")),

    last_name: Yup.string()
      .required(i18n.t("errors.lastNameRequired"))
      .min(2, i18n.t("errors.nameTooShort")),

    email: Yup.string()
      .required(i18n.t("errors.emailRequired"))
      .email(i18n.t("errors.invalidEmail")),

    password: Yup.string()
      .required(i18n.t("errors.passwordRequired"))
      .min(8, i18n.t("errors.passwordMin"))
      .test("password-strength", function (value) {
        if (!value) return false;

        const missingRules = [];
        if (!/[A-Z]/.test(value)) missingRules.push(i18n.t("errors.uppercaseRequired"));
        if (!/[a-z]/.test(value)) missingRules.push(i18n.t("errors.lowercaseRequired"));
        if (!/[0-9]/.test(value)) missingRules.push(i18n.t("errors.numberRequired"));
        if (!/[\W_]/.test(value)) missingRules.push(i18n.t("errors.specialCharRequired"));

        if (missingRules.length > 0) {
          return this.createError({
            message: i18n.t("errors.passwordStrength", {
              rules: missingRules.join("، ")
            })
          });
        }
        return true;
      }),

    role: Yup.string()
      .required(i18n.t("errors.roleRequired"))
      .oneOf(
        ["admin", "player", "agent"],
        i18n.t("errors.invalidRole", {
          roles: `${i18n.t("admin")}, ${i18n.t("player")}, ${i18n.t("agent")}`
        })
      )
  });
