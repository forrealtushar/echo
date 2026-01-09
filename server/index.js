import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',userRoutes)

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log('DB connection successful')
})
.catch((err)=>{
    console.log(err)
})

app.get('/',(req,res)=>{
    res.send('Echo server is running')
})

app.listen(3000)