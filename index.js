import express from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes.js"

import dotenv from "dotenv"
dotenv.config()

// ✅ OVO MORA PRVO
const app = express()

// ✅ GraphQL importi
import { graphqlHTTP } from "express-graphql"
import { schema } from "./graphql/schema.js"
import { root } from "./graphql/resolver.js"

// middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

app.use(express.json())

// REST rute (može ostati)
app.use('/auth', authRouter)

// ✅ TEK SAD GraphQL
app.use("/graphql", graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}))

// server start
app.listen(process.env.PORT, () => {
  console.log("running...")
})

export default app