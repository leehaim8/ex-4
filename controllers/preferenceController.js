const { dbConnection } = require('../db_connection');

const TABLE_NAME = "tbl_37";

const preferenceController = {
    async getPreference(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [rows] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_preferences`);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        } finally {
            if (connection) connection.end();
        }
    },
    async addPreference(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [user] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_users WHERE id = ?`,[req.body.user_id]);
            if (user.length === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const [result] = await connection.execute(`INSERT INTO ${TABLE_NAME}_preferences (user_id, startDate, endDate, destination, vacationType) VALUES (?,?,?,?,?)`,[req.body.user_id, req.body.startDate, req.body.endDate, req.body.destination, req.body.vacationType]);
            const [preference] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_preferences`);
            res.status(201).json(preference);
        } catch (error) {
            console.error('Error adding preference:', error);
            res.status(500).json({ error: 'Error adding preference' });
        } finally {
            if (connection) connection.end();
        }
    },
    async updatePreference(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME}_users WHERE userAccessCode = ?`, [req.params.accessCode]);
            if (users.length === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const userId = users[0].id;
            const [preferences] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_preferences WHERE user_id = ?`, [userId]);
            if (preferences.length === 0) {
                res.status(404).json({ error: 'Preference not found' });
                return;
            }
            const [result] = await connection.execute(`UPDATE ${TABLE_NAME}_preferences SET startDate = ?, endDate = ?, destination = ?, vacationType = ? WHERE user_id = ?`, [req.body.startDate, req.body.endDate, req.body.destination, req.body.vacationType, userId]);
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Preference not updated' });
                return;
            }
            const [updatedPreference] = await connection.execute(
                `SELECT * FROM ${TABLE_NAME}_preferences WHERE user_id = ?`, [userId]);
            res.status(200).json(updatedPreference[0]);
        } catch (error) {
            console.error('Error updating preference:', error);
            res.status(500).json({ error: 'Error updating preference' });
        } finally {
            if (connection) connection.end();
        }
    }
};


module.exports = { preferenceController };