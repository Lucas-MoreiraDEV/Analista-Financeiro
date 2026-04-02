import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import stripeRoutes from './routes/stripe.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

app.use('/api/stripe', stripeRoutes)

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})</content>
<parameter name="filePath">/home/lucas/Documents/Projetos/Analista Financeiro/backend/index.ts