const { dbConnection } = require('../db_connection');
const { countries } = require('../data/countries.json');
const { vacationTypes } = require('../data/vacationTypes.json');

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
    async getPreferenceByUsername(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME}_users WHERE userName = ?`, [req.params.userName]);
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
            res.json(preferences[0]);
        } catch (error) {
            console.error('Error getting preference by username:', error);
            res.status(500).json({ error: 'Error getting preference by username' });
        } finally {
            if (connection) connection.end();
        }
    },
    async addPreference(req, res) {
        let connection;
        try {
            connection = await dbConnection.createConnection();
            if (!req.body.userAccessCode || !req.body.startDate || !req.body.endDate || !req.body.destination || !req.body.vacationType) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME}_users WHERE userAccessCode = ?`, [req.body.userAccessCode]);
            if (users.length === 0) {
                res.status(404).json({ error: 'User with this access code not found' });
                return;
            }
            console.log(users[0].id);
            const userId = users[0].id;
            const [preferences] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_preferences WHERE user_id = ?`, [userId]);
            if (preferences.length > 0) {
                res.status(400).json({ error: 'User already has a preference' });
                return;
            }
            if (!countries.includes(req.body.destination)) {
                res.status(400).json({ error: 'Invalid destination' });
                return;
            }
            if (!vacationTypes.includes(req.body.vacationType)) {
                res.status(400).json({ error: 'Invalid vacation type' });
                return;
            }
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
            const dateDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (startDate > endDate || dateDiff > 7) {
                res.status(400).json({ error: 'Invalid date range, must be up to 7 days and end date should be after start date' });
                return;
            }
            const [result] = await connection.execute(`INSERT INTO ${TABLE_NAME}_preferences (user_id, startDate, endDate, destination, vacationType) VALUES (?,?,?,?,?)`,[userId, req.body.startDate, req.body.endDate, req.body.destination, req.body.vacationType]);
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
            if (!req.body.userAccessCode || !req.body.startDate || !req.body.endDate || !req.body.destination || !req.body.vacationType) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME}_users WHERE userAccessCode = ?`, [req.body.userAccessCode]);
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
            if (!countries.includes(req.body.destination)) {
                res.status(400).json({ error: 'Invalid destination' });
                return;
            }
            if (!vacationTypes.includes(req.body.vacationType)) {
                res.status(400).json({ error: 'Invalid vacation type' });
                return;
            }
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
            const dateDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (startDate > endDate || dateDiff > 7) {
                res.status(400).json({ error: 'Invalid date range, must be up to 7 days and end date should be after start date' });
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
    },
    async getVacationResults(req, res) {
        let connection;
        try {
        connection = await dbConnection.createConnection();
        const [preferences] = await connection.execute(`SELECT * FROM ${TABLE_NAME}_preferences`);
        if (preferences.length < 5) {
            res.status(404).json({ error: 'Not all users have submitted their preferences' });
            return;
        }
        const [destinationResult] = await connection.execute(`select destination from ${TABLE_NAME}_preferences group by destination order by count(*) desc limit 1;`);
        const destination = destinationResult[0].destination;
        const [vacationTypeResult] = await connection.execute(`select vacationType from ${TABLE_NAME}_preferences group by vacationType order by count(*) desc limit 1;`);
        const vacationType = vacationTypeResult[0].vacationType;

        const [startDateResult] = await connection.execute(`select startDate from ${TABLE_NAME}_preferences order by startDate DESC limit 1;`);
        const startDate = startDateResult[0].startDate;
        const [endDateResult] = await connection.execute(`select endDate from ${TABLE_NAME}_preferences order by endDate ASC limit 1;`);
        const endDate = endDateResult[0].endDate;
        const dateDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (startDate > endDate || dateDiff > 7) {
            res.status(400).json({ error: 'Invalid date range, must be up to 7 days and end date should be after start date' });
            return;
        }
        res.json({ destination, vacationType, startDate, endDate});

        } catch (error) {
            console.error('Error getting vacation results:', error);
            res.status(500).json({ error: 'Error getting vacation results' });
        } finally {
            if (connection) connection.end();
        }
    }
};

module.exports = { preferenceController };