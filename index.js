import express from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes.js"

import dotenv from 'dotenv';
dotenv.config();


const app = express()
app.use(cors({
    origin: ['https://dare2win.netlify.app/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));
  

app.use(express.json())
app.use('/auth',authRouter)

app.listen(process.env.PORT,()=>{
    console.log("running...")
})