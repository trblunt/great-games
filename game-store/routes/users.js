var express = require('express');
var router = require('express-promise-router')();
var db = require('../db');

router.get('/', function(req, res, next) {
  if (req.session.user) {
    res.redirect('/users/profile');
  }
  res.redirect('/users/login');
});

router.get('/login', async function(req, res) {
  if (req.session.user_id) {
    res.redirect('/users/profile');
  }
  res.render('login');
})

router.post('/login', async function(req, res) {
  // Form data is in req.body
  const { first_name, last_name, password } = req.body;
  // Check the Customer table for a matching username and password
  // If there is a match, set the session variable
  console.log(req.body)
  var { rows } = await db.query('SELECT * FROM Customer WHERE first_name = $1 AND last_name = $2 AND password = $3', [first_name, last_name, password])
  console.log(rows)
  if (rows.length > 0) {
    req.session.user = { first_name: rows[0].first_name, last_name: rows[0].last_name, id: rows[0].customer_id }
    req.session.save(() => {
      res.redirect('/')
    })
  } else {
    res.render('login', { error: 'Invalid username or password' })
  }
})

router.get('/register', async function(req, res) {
  if (req.session.user) {
    res.redirect('/users/profile');
  }
  res.render('register');
})

router.post('/register', async function(req, res) {
  // Form data is in req.body
  const { first_name, last_name, age, password } = req.body;
  // Check the Customer table if this first name and last name already exists
  console.log(req.body);
  var result = await db.query('SELECT COUNT(DISTINCT customer_id) FROM Customer WHERE first_name = $1 AND last_name = $2', [first_name, last_name])
  console.log(result)
  if (result.rows[0].count > 0) {
    res.render('register', { error: 'This username already exists' })
    return
  }
  if (age < 13) {
    res.render('register', { error: 'You must be 13 years old or older to register' })
    return
  }
  // If it does not exist, insert the new user into the Customer table
  var result = await db.query('INSERT INTO Customer (first_name, last_name, age, password) VALUES ($1, $2, $3, $4) RETURNING customer_id', [first_name, last_name, age, password])
  req.session.user = { first_name: first_name, last_name: last_name, id: result.rows[0].customer_id }
  res.redirect('/')
})

router.get('/logout', async function(req, res) {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

router.get('/profile', async function(req, res) {

  if (!req.session.user) {
    res.redirect('/users/login');
  }

  var { rows: customers } = await db.query('SELECT * FROM Customer WHERE customer_id = $1', [req.session.user.id])

  let customer = customers[0]

  var { rows: ownedGames } = await db.query('SELECT DISTINCT Game.game_id, Game.* FROM Game, Game_Order, Customer WHERE Customer.customer_id = $1 AND Customer.customer_id=Game_Order.customer_id AND Game_Order.game_id=Game.game_id', [req.session.user.id])

  var { rows: orders } = await db.query('SELECT to_char(date,\'DD-MM-YYYY\') as date, order_id, Game.game_id, supplier_id, customer_id, payment_id, Game.name AS game_name FROM Game_Order, Game WHERE customer_id = $1 AND Game_Order.game_id = Game.game_id', [req.session.user.id])

  var { rows: paymentMethods } = await db.query('SELECT * FROM Payment_Method WHERE customer_id = $1', [req.session.user.id])

  res.render('profile', { customer: customer, ownedGames: ownedGames, orders: orders, paymentMethods: paymentMethods })

})

router.post('/add-payment', async function(req, res) {
  const { card_number, exp_date } = req.body;
  var result = await db.query('INSERT INTO Payment_Method (card_number, exp_date, customer_id) VALUES ($1, $2, $3)', [card_number, exp_date, req.session.user.id]);
  res.redirect('/users/profile');
})

module.exports = router;
