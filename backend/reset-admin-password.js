require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const USER_UID = "0a8b5e9e-d37a-4d6d-9b8b-6373ccd1786f"; // safique@gmail.com
const NEW_PASSWORD = process.argv[2];

if (!NEW_PASSWORD) {
  console.error("Usage: node reset-admin-password.js <new-password>");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);

supabase.auth.admin.updateUserById(USER_UID, { password: NEW_PASSWORD }).then(({ data, error }) => {
  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
  console.log("Password updated for", data.user.email);
});
