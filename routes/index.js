const authRoute = require("./authRoute")
const adminRoute = require("./adminRoute")
const empRoute = require("./empRoute")
const drinkRoute = require("./drinkRoute")
const userRoute = require("./userRoute")


const mountRoutes = (app)=>{
app.use('/api/admin',adminRoute),
app.use('/api/auth',authRoute),
app.use('/api/users',userRoute),
app.use('/api/emp',empRoute),
app.use('/api/drink',drinkRoute)
}


module.exports = mountRoutes

