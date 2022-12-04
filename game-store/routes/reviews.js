var express = require('express');
var router = require('express-promise-router')();
var db = require('../db');

router.post('/', async function(req, res) {
  if (!req.session.user) {
    res.redirect('/users/login');
  }
  // Form data is in req.body
  const { game_id, comment, score } = req.body;
  // Check the Customer table for a matching username and password
  // If there is a match, set the session variable
  var { rows } = await db.query('INSERT INTO Review (game_id, customer_id, comment, score) VALUES ($1, $2, $3, $4)', [game_id, req.session.user.id, comment, score])
  res.redirect('/games/' + game_id)
})

router.post('/delete', async function(req, res) {
  if (!req.session.user) {
    res.redirect('/users/login');
  }
  // Form data is in req.body
  const { game_id, review_id } = req.body;
  // Check if the review belongs to the user
  var { rows } = await db.query('SELECT * FROM Review WHERE review_id = $1 AND customer_id = $2', [review_id, req.session.user.id])
  if (rows.length == 0) {
    res.redirect('/games/' + game_id)
  }
  var { rows } = await db.query('DELETE FROM Review WHERE review_id = $1', [review_id])
  res.redirect('/games/' + game_id)
})

module.exports = router;
