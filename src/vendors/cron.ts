import cron from "node-cron";
import User from "../entities/User";

function start() {
    cron.schedule('0 */2 * * *', () => {
        return User.syncPartnerLinks();
    });
}

export {
    start
};