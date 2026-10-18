const app = require("./src/app");
const connectDB = require("./src/config/db");
const { port } = require("./src/config/env");
const { startAutoDeleteContentJob } = require("./src/jobs/autoDeleteContent.job");
const { startEventReminderJob } = require("./src/jobs/eventReminder.job");
const { startExpireReservedSlotsJob } = require("./src/jobs/expireReservedSlots.job");

async function startServer() {
    try {
        await connectDB();
        startAutoDeleteContentJob();
        startEventReminderJob();
        startExpireReservedSlotsJob();
        app.listen(port, () => {
            console.log(`Server is listening on Port: ${port}`);
        });
    } catch (err) {
        console.error("Failed to connect to Database:", err);
    }
}

startServer();
