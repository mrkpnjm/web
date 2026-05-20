require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/db");

async function migrate() {
    const migrationsDir = path.join(__dirname, "../migrations");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        console.log(`Running ${file}...`);
        await pool.query(sql);
    }
    console.log("Migrations complete.");
    await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
