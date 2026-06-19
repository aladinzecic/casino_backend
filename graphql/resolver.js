import { connectToDatabase } from "../lib/db.js";
import bcrypt from "bcrypt";

export const root = {

  // ✅ QUERY

  getUser: async ({ id }) => {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  getUsers: async () => {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT id, username, email FROM users");
    return rows;
  },

  getMoney: async ({ id }) => {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT money FROM users WHERE id = ?", [id]);
    return rows[0]?.money;
  },

  getAdminData: async () => {
    const db = await connectToDatabase();

    const [totalUsers] = await db.query('SELECT COUNT(*) AS count FROM users');
    const [newUsers] = await db.query(
      'SELECT COUNT(*) AS dailyUsers FROM users WHERE DATE(FROM_UNIXTIME(createdAt / 1000)) = CURDATE()'
    );
    const [activeUsers] = await db.query(
      'SELECT COUNT(*) AS activeUsers FROM users WHERE lastActiveAt > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MINUTE)) * 1000'
    );
    const [deposited] = await db.query(
      'SELECT SUM(depositedMoney) AS totalDeposited FROM users'
    );
    const [withdrawn] = await db.query(
      'SELECT SUM(withdrawnMoney) AS withdrawnMoney FROM users'
    );

    return {
      totalUsers: totalUsers[0].count,
      newUsers: newUsers[0].dailyUsers,
      activeUsers: activeUsers[0].activeUsers,
      totalDeposited: deposited[0].totalDeposited,
      withdrawnMoney: withdrawn[0].withdrawnMoney
    };
  },

  // ✅ MUTATIONS

  register: async ({ username, email, password }) => {
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      throw new Error("User already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username,password,email,createdAt,isActive) VALUES (?,?,?,?,?)",
      [username, hashedPassword, email, Date.now(), 1]
    );

    return "User created!";
  },

  login: async ({ email, password }) => {
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) throw new Error("User not found");

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    if (user.isBanned) throw new Error("User banned");

    return user;
  },

  updateMoney: async ({ id, money }) => {
    const db = await connectToDatabase();

    await db.query(
      "UPDATE users SET money = ? WHERE id = ?",
      [money, id]
    );

    return "Money updated";
  },

  deposit: async ({ id, amount }) => {
    const db = await connectToDatabase();

    await db.query(
      "UPDATE users SET depositedMoney = depositedMoney + ? WHERE id = ?",
      [amount, id]
    );

    return "Deposited!";
  },

  banUser: async ({ id }) => {
    const db = await connectToDatabase();

    await db.query(
      "UPDATE users SET isBanned = 1 WHERE id = ?",
      [id]
    );

    return "User banned";
  }
};