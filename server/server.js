/**
 * Local Development Server
 * 
 * Runs the Express app on localhost port 5000.
 */
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    // Initialize cron jobs
    const initCronJobs = require('./cron');
    initCronJobs();
});
