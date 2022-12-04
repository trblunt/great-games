var express = require('express');
var router = require('express-promise-router')();
var db = require('../db');

/* GET users listing. */
router.get('/', function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/users/login');
    }
    res.redirect('/users/profile');
});

router.get('/new/:game_id/:supplier_id', async function(req, res) {
    const { game_id, supplier_id } = req.params;
    if (!req.session.user) {
        res.redirect('/users/login');
    }
    // Check the Game and Supply and Supplier tables for the game and supplier information
    var { rows: supplies } = await db.query('SELECT Supplier.name AS supplier_name, Game.name AS game_name, * FROM Supply, Game, Supplier WHERE Game.game_id = Supply.game_id AND Supply.supplier_id = Supplier.supplier_id AND Game.game_id = $1 AND Supply.supplier_id = $2', [game_id, supplier_id])
    // Get the User's payment methods
    
    supplies.forEach(supply => {
        supply.price = (parseFloat(supply.price)).toFixed(2);
    })
    
    var { rows: payment_methods } = await db.query('SELECT payment_id AS id, card_number, exp_date FROM Payment_Method WHERE customer_id = $1', [req.session.user.id])

    if (payment_methods.length == 0) {
        res.redirect('/users/profile?error=' + encodeURIComponent('You must add a payment method before you can place an order'))
    }
    
    res.render('new_order', { supply: supplies[0], payment_methods: payment_methods });
})

router.post('/new/', async function(req, res) {

    if (!req.session.user) {
        res.redirect('/users/login');
    }
    // Form data is in req.body
    const { game_id, supplier_id, payment_id } = req.body;

    // Insert the new order into the Order table
    var result = await db.query('INSERT INTO Game_Order (date, customer_id, payment_id, game_id, supplier_id) VALUES (CURRENT_DATE, $1, $2, $3, $4) RETURNING order_id', [req.session.user.id, payment_id, game_id, supplier_id])

    var order_id = result.rows[0].order_id

    res.redirect('/orders/' + order_id)

})

router.get('/:order_id', async function(req, res) {
    if (!req.session.user) {
        res.redirect('/users/login');
    }
    const { order_id } = req.params;
    // Check the Order table for the order information
    var { rows: orders } = await db.query('SELECT to_char(date,\'DD-MM-YYYY\') as date, order_id, game_id, supplier_id, customer_id, payment_id FROM Game_Order WHERE order_id = $1', [order_id])
    if (orders[0].customer_id != req.session.user.id) {
        res.redirect('/users/profile?error=' + encodeURIComponent('You do not have permission to view this order'))
    }
    // Check the Supply table for the supply information
    var { rows: supplies } = await db.query('SELECT Supplier.name AS supplier_name, Game.name AS game_name, * FROM Supply, Game, Supplier WHERE Game.game_id = Supply.game_id AND Supply.supplier_id = Supplier.supplier_id AND Game.game_id = $1 AND Supply.supplier_id = $2', [orders[0].game_id, orders[0].supplier_id])
    
    supplies.forEach(supply => {
        supply.price = (parseFloat(supply.price)).toFixed(2);
    })
    
    // Get the User's payment methods
    var { rows: payment_methods } = await db.query('SELECT payment_id AS id, card_number, exp_date FROM Payment_Method WHERE payment_id = $1', [orders[0].payment_id])

    res.render('order', { order: orders[0], supply: supplies[0], payment_method: payment_methods[0] });
})

module.exports = router;
