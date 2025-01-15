import express from 'express'
import cors from 'cors'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import globalErrorHandler from './controller/errorController.js'
import router from './routes/userRouter.js'

const app = express()
dotenv.config()
// app.use(cookieParser)

app.use(cors({
    origin:["http://localhost:3000"],
    credentials:true
}))

app.use(express.json({ limit: '1mb' })) 

app.use('/api/user', router)
app.get('/', (req,res) => {
    res.send("This is home")
})

app.all("/jj", (req,res, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server`,404 ))
})

app.use(globalErrorHandler)

export default app
