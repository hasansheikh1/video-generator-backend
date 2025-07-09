const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require("cookie-parser")
const cors = require('cors');
const morgan = require('morgan')

dbConnect();
app.use(cors())
app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("Deployed! ");
})

app.use("/api/user", authRouter)

app.use(notFound)
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})