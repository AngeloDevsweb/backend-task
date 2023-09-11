import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'

const app = express()

//middlewares
app.use(cors({ 
    credentials:true,
    origin: 'http://localhost:5173'
}))
app.use(morgan('dev'));
app.use(express.json())
app.use(cookieParser())

app.use(authRoutes)
app.use(tasksRoutes)

export default app;