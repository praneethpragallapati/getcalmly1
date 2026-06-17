-- Email + password sign-in: salted scrypt hash (scrypt$salt$hash), nullable so
-- existing OAuth / OTP accounts are unaffected.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
