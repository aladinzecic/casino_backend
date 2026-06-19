import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type User {
    id: ID!
    username: String
    email: String
    money: Float
    isBanned: Boolean
  }

  type AdminData {
    totalUsers: Int
    newUsers: Int
    activeUsers: Int
    totalDeposited: Float
    withdrawnMoney: Float
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
    getMoney(id: ID!): Float
    getAdminData: AdminData
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): String
    login(email: String!, password: String!): User

    updateMoney(id: ID!, money: Float!): String
    deposit(id: ID!, amount: Float!): String

    banUser(id: ID!): String
  }
`);


// {
//   getUsers {
//     id
//     username
//     email
//   }
// }


// {
//   getUser(id: "1") {
//     username
//     email
//     money
//   }
// }


// mutation {
//   register(
//     username: "test"
//     email: "test@test.com"
//     password: "123"
//   )
// }