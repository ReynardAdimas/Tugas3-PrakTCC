const express = require("express")
const sequelize = require("./config/database")
const noteRoutes = require("./routes/noteRoutes") 
const cors = require("cors") 
const app = express() 

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type']
})) 
app.use(express.json()) 

app.get("/", (req, res) => {
    res.send("Testing backend")
}) 

require("./schema/Note")
app.use("/api/v1/notes", noteRoutes) 

const port = process.env.PORT || 8080 
sequelize.sync({alter:true}).then(() => {
    console.log("Database synced")
    app.listen(port, () => console.log(`Server running on port ${port}`))
})
