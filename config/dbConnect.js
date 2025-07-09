const { default: mongoose } = require("mongoose")


const dbConnect = async () => {

    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log("Db connected successfully")
    }
    catch (error) {
        console.log("Db Error", error)
    }


};

module.exports = dbConnect;