const { dbConnection } = require('../db_connection');

const TABLE_NAME = "tbl_37";

const userController = {
    async getUsers(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [rows] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users`);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        } finally {
            if (connection) connection.end();
        }
    },
    async addUser(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [result] = await connection.execute(`INSERT INTO ${TABLE_NAME}_users (userName, userPassword, userAccessCode) VALUES (?, ?, ?)`, [req.body.userName, req.body.userPassword, req.body.userAccessCode]);
            const [user] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_use WHERE id = ?`, [result.insertId]);
            res.json(user[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error adding user' });
        } finally {
            if (connection) connection.end();
        }
    }
};

module.exports = { userController };