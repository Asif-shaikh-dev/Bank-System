import { collectDueEmis } from "./emiCollection.js";

let timer = null;
let running = false;      // stops two runs overlapping if one takes longer than the interval
let seconds = 0;

const tick = async (demo) => {
    if (running) return;
    running = true;
    try {
        const s = await collectDueEmis(null, { demo });
        if (s.collected || s.overdue) {
            console.log(`[EMI] collected ${s.collected} (₹${s.total_collected}, interest ₹${s.interest_earned}), overdue ${s.overdue}`);
        }
    } catch (e) {
        console.error("EMI collection failed:", e);
    } finally {
        running = false;
    }
};

// seconds > 0 : demo mode, one EMI per active loan every N seconds
// seconds = 0 : real mode, checks once a day for EMIs that are actually due
export const setEmiInterval = (sec) => {
    if (timer) clearInterval(timer);
    seconds = sec;
    if (sec > 0) {
        timer = setInterval(() => tick(true), sec * 1000);
        console.log(`[EMI] demo mode: collecting every ${sec}s`);
    } else {
        tick(false);
        timer = setInterval(() => tick(false), 24 * 60 * 60 * 1000);
        console.log("[EMI] real mode: checking daily");
    }
};

export const getEmiInterval = () => seconds;