const { dbConnection } = require('../db_connection');

const TABLE_NAME = "tbl_37";

const userController = {
    async addUser(req, res) {
        let connection;
    try {
        if (!req.body.userName || !req.body.userPassword) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        connection = await dbConnection.createConnection();
        const [rows] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users`);
        if (rows.length >= 5) {
            res.status(400).json({ error: 'Max users reached' });
            return;
        }
        if (!req.body.userName || !req.body.userPassword) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const [existingUser] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users WHERE userName = ?`, [req.body.userName]);
        if (existingUser.length > 0) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        let userAccessCode = 111;
        let accessCodeExists = true;
        while (accessCodeExists) {
            const [existingUser] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users WHERE userAccessCode = ?`, [userAccessCode]);
            if (existingUser.length > 0) {
                userAccessCode++;
            } else {
                accessCodeExists = false;
            }
        }
        const [result] = await connection.execute(`INSERT INTO ${TABLE_NAME}_users (userName, userPassword, userAccessCode) VALUES (?, ?, ?)`,[req.body.userName, req.body.userPassword, userAccessCode]);
        const [user] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users WHERE id = ?`,[result.insertId]);
        res.json(user[0]);
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Error adding user' });
    } finally {
        if (connection) connection.end();
    }
    }
};

module.exports = { userController };