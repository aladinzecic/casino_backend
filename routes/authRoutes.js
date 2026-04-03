import express from "express"
import {connectToDatabase} from "../lib/db.js"
import bcrypt from "bcrypt"
const router = express.Router()

router.post('/register', async (req,res)=>{
    const {username,password,email}=req.body
    try{
        const now = Date.now()
        const db = await connectToDatabase()

        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        if(rows.length > 0){
            return res.status(409).json({message:"users with this email already exists!"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.query(
            'INSERT INTO users (username,password,email,createdAt,isActive) VALUES (?,?,?,?,?)',
            [username, hashedPassword, email, now, 1]
        )

        res.status(201).json({message:"users succesfuly created!"})
    }   
    catch(err){
        res.status(500).json(err)
    }
})

router.post('/login', async (req,res)=>{
    
    const {email,password} = req.body

    try {
        const db = await connectToDatabase()

        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        if (rows.length === 0) {
            return res.status(404).json({ message: "users with this email doesn't exist!" })
        }

        const user = rows[0]

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials!" })
        }

        if(user.isBanned){
            return res.status(403).json({ message: "User is banned!" })
        }

        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                isBanned: user.isBanned
            }
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "An error occurred", details: err })
    }
})

router.get('/user', async (req, res) => {
    const { userId } = req.query;
    try {
        const db = await connectToDatabase();

        const [rows] = await db.query('SELECT  username, razred,caracterNum,caracterEvolLevel,dayStreak,totalXp,numOfCookies,dailySpinsLeft,mathCurr,englishCurr,infoCurr,geoCurr FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'users not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving users data', details: err });
    }
});

router.get('/getPage', async (req, res) => {
    const { userId,page } = req.query;
    try {
        const db = await connectToDatabase();

        const [rows] = await db.query('SELECT  rouletteVisited, plinkoVisited,huntVisited,minesVisited FROM users WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
          return res.status(404).json({ message: 'users not found' });
        }
        if(page==="PLINKO"){
          res.json(rows[0].plinkoVisited);
        }
        else if(page==="ROULLETE"){
          res.json(rows[0].rouletteVisited);
        }
        else if(page==="HUNT"){
          res.json(rows[0].huntVisited);
        }
        else if(page==="MINES"){
          res.json(rows[0].minesVisited);
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving users data', details: err });
    }
});

router.post('/updateMoney', async (req, res) => {
    const { userId, money } = req.body;
  
    try {
      const db = await connectToDatabase();
  
      await db.query(
        'UPDATE users SET money = ? WHERE id = ?',
        [money, userId]
      );

      res.status(200).json({ message: 'Caracter number and evolution level updated successfully!' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating caracter number and evolution level' });
    }
  });


router.post('/updatePage', async (req, res) => {
    const { userId, page } = req.body;
  
    try {
      const db = await connectToDatabase();
  
      if(page==="ROULLETE"){
        await db.query(
          'UPDATE users SET rouletteVisited = ? WHERE id = ?',
          [true, userId]
        );
      }
      else if(page==="PLINKO"){
        await db.query(
          'UPDATE users SET plinkoVisited = ? WHERE id = ?',
          [true, userId]
        );
      }
      else if(page==="HUNT"){
        await db.query(
          'UPDATE users SET huntVisited = ? WHERE id = ?',
          [true, userId]
        );
      }
      else if(page==="MINES"){
        await db.query(
          'UPDATE users SET minesVisited = ? WHERE id = ?',
          [true, userId]
        );
      }
  
      res.status(200).json({ message: 'Caracter number and evolution level updated successfully!' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating caracter number and evolution level' });
    }
  });


router.get('/getMoney/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const db = await connectToDatabase();
  
      const [rows] = await db.query(
        'SELECT money FROM users WHERE id = ?',
        [userId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'users not found' });
      }
  
      const money = rows[0].money;
  
      res.status(200).json({ money });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching users money' });
    }
  });


router.get('/getUserData/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const db = await connectToDatabase();
  
      const [rows] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'users not found' });
      }
  
      const all = rows[0];
  
      res.status(200).json({ all });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching users money' });
    }
  });


router.post('/getId', async (req, res) => {
    const { email } = req.body;
  
    try {
      const db = await connectToDatabase();
  
      const [rows] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'users not found' });
      }
  
      const id = rows[0].id;
  
      res.status(200).json({ id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching users id' });
    }
  });
  

 router.get('/getAdminData', async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [numOfUsersRows] = await db.query('SELECT COUNT(*) AS count FROM `users`');

    const [newUsersRows] = await db.query(
      'SELECT COUNT(*) AS dailyUsers FROM `users` WHERE DATE(FROM_UNIXTIME(createdAt / 1000)) = CURDATE()'
    );

    const [activeUsersRows] = await db.query(
      'SELECT COUNT(*) AS activeUsers FROM `users` WHERE lastActiveAt > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MINUTE)) * 1000'
    );

    const [totalDepositedRows] = await db.query(
  'SELECT SUM(depositedMoney) AS totalDeposited FROM users'
);
    const [totalWithdrawnRows] = await db.query(
  'SELECT SUM(withdrawnMoney) AS withdrawnMoney FROM users'
);

    res.status(200).json({
      totalUsers: numOfUsersRows[0].count,
      newUsers: newUsersRows[0].dailyUsers,
      activeUsers: activeUsersRows[0].activeUsers,
      withdrawnMoney: totalWithdrawnRows[0].withdrawnMoney,
      totalDeposited: totalDepositedRows[0].totalDeposited
    });

  } catch (e) {
    console.error("Error in /getAdminData:", e);
    res.status(500).json({ message: 'Error fetching users count', error: e.message });
  }
});

router.post('/updateActivity', async (req, res) => {
  const { userId } = req.body;
  const db = await connectToDatabase();

  try {
    const [result] = await db.query(
      'UPDATE users SET lastActiveAt = ? WHERE id = ?',
      [Date.now(), userId]
    );

    res.status(200).json({ message: 'Activity updated successfully' });
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ message: 'Error updating activity', error: err.message });
  }
});

router.post('/deposit', async (req, res) => {
  const { depositedMoney,userId } = req.body;
  const db = await connectToDatabase();

  try {
    const [result] = await db.query(
      'UPDATE users SET depositedMoney = ? WHERE id = ?',
      [depositedMoney, userId]
    );

    res.status(200).json({ message: 'Activity updated successfully' });
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ message: 'Error updating activity', error: err.message });
  }
});

router.get("/users", async (req, res) => {
  const db = await connectToDatabase()

  const [rows] = await db.query("SELECT id, username, email FROM users")

  res.json(rows)
})

router.post("/ban-user", async (req, res) => {
  try {
    const { id } = req.body

    const db = await connectToDatabase()

    await db.query(
      "UPDATE users SET isBanned = 1 WHERE id = ?",
      [id]
    )

    res.status(200).json({ message: "User banned successfully" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" })
  }
})
  
export default router