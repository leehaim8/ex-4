const { dbConnection } = require('../db_connection');

const TABLE_NAME = "tbl_37";

const userController = {
    async getUsers(req, res) {
        const connection = await dbConnection.createConnection();
        const [rows] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users`);
        res.json(rows);
    },
    async addUser(req, res) {
        const connection = await dbConnection.createConnection();
        const [result] = await connection.execute(`INSERT INTO ${TABLE_NAME}_users (userName, userPassword, userAccessCode) VALUES (?,?,?)`, [req.body.userName, req.body.userPassword, req.body.userAccessCode]);
        const [user] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users WHERE id = ?`, [result.insertId]);
        connection.end();
        res.json(user[0]);
    }
};

module.exports = { userController };