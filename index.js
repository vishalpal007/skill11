const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config("./.env")


mongoose.connect(process.env.MONGO_URL)
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))


app.use("/api/v1/auth", require("./routes/authRoute/userRoute"))
app.use("/api/v1/admin/matches", require("./routes/admin/match/matchRoute"))
app.use("/api/v1/admin/contest", require("./routes/admin/contest/contestRoute"))

app.use("*", (req, res) => {
    res.status(404).json({ message: "No Resource Found" })
})


app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({ message: err.message || "Something went wrong" })
})


mongoose.connection.once("open", () => {
    console.log("Mongoose connected")
    app.listen(process.env.PORT, console.log(`Server running ${process.env.PORT}`))
})