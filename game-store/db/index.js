const { Pool } = require('pg')

const pool = new Pool({
	host: 'localhost',
	user: 'postgres',
	// password: 'password',
	database: 'project',
})

module.exports = {
	  query: (text, params) => pool.query(text, params),
	  pool: pool,
}