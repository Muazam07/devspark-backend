const UserEnum = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  ACCOUNT_VERIFICATION_SUBJECT: "DevsPark Account Verification",
  PASSWORD_RESET_SUBJECT: "DevsPark Password Reset",
  INACTIVE_ACCOUNT_MESSAGE:
    "Your account is inactive. Please contact an administrator.",
  UNVERIFIED_ACCOUNT_MESSAGE:
    "Your account is inactive. Please activate your account.",
  VERIFICATION_CODE_EXPIRES_MS: 10 * 60 * 1000,
  PASSWORD_HASH_ROUNDS: 10,
});

module.exports = UserEnum;
