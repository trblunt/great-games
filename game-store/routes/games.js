var express = require('express');
var router = require('express-promise-router')();
var db = require('../db');

/* GET Games list */
router.get('/', async function(req, res) {
    let games_per_page = 20;
    var current_page = parseInt(req.query.page) || 1;
    var offset = (current_page - 1) * games_per_page;
    var { rows } = await db.query('SELECT COUNT(*) FROM Game');
    var count = rows[0].count;
    var numPages = Math.ceil(count / games_per_page);
    var { rows } = await db.query('SELECT * FROM Game LIMIT $1 OFFSET $2', [games_per_page, offset]); 
    res.render('games', { games: rows, pages: {current: current_page, count: numPages} });
});

/* GET Game details */
router.get('/:id', async function(req, res) {
    var game_query = await db.query('SELECT * FROM Game WHERE game_id = $1', [req.params.id]);
    // Fetch the lowest price for this game
    var supply_query = await db.query('SELECT price, supplier_id AS id, name, address FROM Supply NATURAL JOIN Supplier WHERE game_id = $1 ORDER BY price LIMIT 5', [req.params.id]);

    // Fetch the average rating for this game
    var avg_rating_query = await db.query('SELECT AVG(score) AS average_score FROM Review WHERE game_id = $1', [req.params.id]);

    console.log(avg_rating_query)

    // Fetch the reviews for this game

    var reviews_query = await db.query('SELECT review_id AS id, customer_id, comment, score, first_name, last_name FROM Review NATURAL JOIN Customer WHERE game_id = $1 AND (comment IS NOT NULL OR Review.customer_id = $2)', [req.params.id, req.session.user ? req.session.user.id : -1]);

    var games = game_query.rows;
    games.forEach(game => {
        game.size = (parseFloat(game.size) / 1E7).toFixed(2);
    })

    var supplies = supply_query.rows;
    supplies.forEach(supply => {
        supply.price = (parseFloat(supply.price)).toFixed(2);
    })

    console.log(games)

    res.render('game', { encodeURIComponent, game: games[0], suppliers: supplies, average_score: (parseFloat(avg_rating_query.rows[0].average_score) * 10).toFixed(2), reviews: reviews_query.rows });
})

module.exports = router;