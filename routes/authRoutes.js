import express from "express"
import {connectToDatabase} from "../lib/db.js"

const router = express.Router()

router.post('/register', async (req,res)=>{
    const {username,password,email}=req.body
    try{
      const now=Date.now()
        const db= await connectToDatabase()
        const [rows]= await db.query('SELECT * FROM users WHERE email = ?',[email])
        if(rows.length>0){
            return res.status(409).json({message:"userswith this email already exists!"})
        }
        await db.query('INSERT INTO users (username,password,email,createdAt,isActive) VALUES (?,?,?,?,?)',[username,password,email,now,1])
        res.status(201).json({message:"userssuccesfuly created!"})
    }   
    catch(err){
        res.status(500).json(err)
    }
})

router.post('/login', async (req,res)=>{
    
    const {email,password}=req.body
    try {
        const db = await connectToDatabase();

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "users with this email doesn't exist!" });
        }

        const user = rows[0];
        if (password!=user.password) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        // Login successful
        res.status(200).json({ mesage: "Login successful!", user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: "An error occurred", details: err });
    }
})


// Ruta koja vraća podatke o korisniku na osnovu njegovog userId
router.get('/user', async (req, res) => {
    const { userId } = req.query;  // Preuzimamo userId iz query parametra
    try {
        // Povezivanje sa bazom podataka
        const db = await connectToDatabase();

        // Upit za pronalaženje korisnika na osnovu userId
        const [rows] = await db.query('SELECT  username, razred,caracterNum,caracterEvolLevel,dayStreak,totalXp,numOfCookies,dailySpinsLeft,mathCurr,englishCurr,infoCurr,geoCurr FROM users WHERE id = ?', [userId]);

        // Ako korisnik nije pronađen, vraćamo 404
        if (rows.length === 0) {
            return res.status(404).json({ message: 'users not found' });
        }

        // Ako je korisnik pronađen, vraćamo njegove podatke
        res.json(rows[0]);
    } catch (err) {
        // Ako dođe do greške u bazi, vraćamo 500
        res.status(500).json({ error: 'Error retrieving users data', details: err });
    }
});
router.get('/getPage', async (req, res) => {
    const { userId,page } = req.query;  // Preuzimamo userId iz query parametra
    try {
        // Povezivanje sa bazom podataka
        const db = await connectToDatabase();

        // Upit za pronalaženje korisnika na osnovu userId
        const [rows] = await db.query('SELECT  rouletteVisited, plinkoVisited,huntVisited,minesVisited FROM users WHERE id = ?', [userId]);
        
        // Ako korisnik nije pronađen, vraćamo 404
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
        // Ako je korisnik pronađen, vraćamo njegove podatke
    } catch (err) {
        // Ako dođe do greške u bazi, vraćamo 500
        res.status(500).json({ error: 'Error retrieving users data', details: err });
    }
});


router.post('/updateMoney', async (req, res) => {
    const { userId, money } = req.body;
  
    try {
      const db = await connectToDatabase();
  
      // Ažuriraj oba svojstva u bazi
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
  
      // Ažuriraj oba svojstva u bazi
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
    // Konekcija sa bazom
    const db = await connectToDatabase();
    
    // SQL upit za broj korisnika
    const numOfUsers = await db.query('SELECT COUNT(*) AS count FROM user');
    const newUsers = await db.query(
      'SELECT COUNT(*) AS dailyUsers FROM users WHERE DATE(FROM_UNIXTIME(createdAt / 1000)) = CURDATE()'
    );
    
    const activeUsers=await db.query(
      'SELECT COUNT(*) AS activeUsers FROM users WHERE lastActiveAt > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MINUTE)) * 1000;'
    )
    const deposited=await db.query(
1    )
    const length = numOfUsers[0]; // Pristup rezultatu
    const newUsersNum=newUsers[0]
    const activeUsersNum=activeUsers[0]
    // Provera rezultata
    if (length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    if (newUsersNum === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Uspešan odgovor
    res.status(200).json({ totalUsers: length, newUsers:newUsersNum, activeUsers:activeUsersNum });
  } catch (e) {
    // Greška na serveru
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
    console.error('Error updating activity:', err);  // Loguj detalje greške
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
    console.error('Error updating activity:', err);  // Loguj detalje greške
    res.status(500).json({ message: 'Error updating activity', error: err.message });
  }
});


  
  
  

export default router