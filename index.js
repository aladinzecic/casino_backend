import express from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes.js"

import dotenv from 'dotenv';
dotenv.config();


const app = express()
app.use(cors({
    origin: 'https://soft-wisp-a67fc0.netlify.app', // Dozvoljava samo ovaj domen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));
  app.use(express.json())
app.use('/auth',authRouter)

app.listen(process.env.PORT,()=>{
    console.log("running...")
})