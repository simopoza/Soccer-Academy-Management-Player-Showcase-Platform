import * as Yup from "yup";

/**
 * Registration Schema
 */
export const registerSchema = (i18n) =>
  Yup.object().shape({
    first_name: Yup.string()
      .trim()
      .required(i18n.t("errors.firstNameRequired"))
      .min(2, i18n.t("errors.nameTooShort")),

    last_name: Yup.string()
      .trim()
      .required(i18n.t("errors.lastNameRequired"))
      .min(2, i18n.t("errors.nameTooShort")),

    email: Yup.string()
      .trim()
      .required(i18n.t("errors.emailRequired"))
      .email(i18n.t("errors.invalidEmail")),

    password: Yup.string()
      .trim()
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

/**
 * Login Schema
 */
export const loginSchema = (i18n) =>
  Yup.object().shape({
    email: Yup.string()
      .trim()
      .required(i18n.t("errors.emailRequired"))
      .email(i18n.t("errors.invalidEmail")),

    password: Yup.string()
      .trim()
      .required(i18n.t("errors.passwordRequired"))
      .min(8, i18n.t("errors.passwordMin"))
  });

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = (i18n) =>
  Yup.object().shape({
    email: Yup.string()
      .trim()
      .required(i18n.t("errors.emailRequired"))
      .email(i18n.t("errors.invalidEmail"))
  });

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = (i18n) =>
  Yup.object().shape({
    newPassword: Yup.string()
      .trim()
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

    confirmNewPassword: Yup.string()
      .trim()
      .required(i18n.t("errors.confirmPasswordRequired"))
      .oneOf([Yup.ref("newPassword"), null], i18n.t("errors.passwordsMustMatch"))
  });
