import app from "./src/app.js";
import connectDb from "./src/config/db.js";
const PORT = process.env.PORT || 5000;


connectDb()
app.listen(PORT, () => {
    console.log(`Loan Service is running on port ${PORT}`);
});
