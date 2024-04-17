const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const connect = async () => {
    if (process.env.MOGNO_URI === undefined) {
        console.log("MONGO_URI is not defined");
        return;
    }
    await mongoose
        .connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("Connected to API Database - Initial Connection");
        })
        .catch((err) => {
            console.log(
                `Initial Distribution API Database connection error occured -`,
                err
            );
        });
};
module.exports = { connect };