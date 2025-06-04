'use strict';

const port = process.env.PORT || 3000;

module.exports = {
    port: process.env.PORT || 3000,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY
}