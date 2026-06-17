-- Drop custom Humanbase auth sessions. Supabase Auth owns auth sessions now.
DROP TABLE IF EXISTS "AuthSession";

-- Keep email as the explicit app-user mapping hint, but remove custom password auth.
ALTER TABLE "User"
DROP COLUMN IF EXISTS "passwordHash",
DROP COLUMN IF EXISTS "authDisabledAt",
ADD COLUMN IF NOT EXISTS "supabaseAuthUserId" TEXT;

-- Map Supabase Auth users to portable Humanbase users without coupling app data
-- tables to Supabase-managed auth schemas.
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseAuthUserId_key" ON "User"("supabaseAuthUserId");
