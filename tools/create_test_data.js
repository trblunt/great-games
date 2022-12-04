// TODO: Get data from steamspy

const NUM_GAMES = 1000
const NUM_SUPPLIERS = 50
const NUM_SUPPLIERS_PER_GAME = 5
const NUM_CUSTOMERS = 4000
const NUM_ORDERS_PER_CUSTOMER = 5

const faker = require('@faker-js/faker').faker
const fs = require('fs').promises

function csv(labels, element_arr) {
	return [labels].concat(element_arr).map(element => element.join("|")).join("\n")
}

async function main() {

	await fs.rm("csv_data", {recursive: true, force: true})
	await fs.mkdir("csv_data")

	const game_labels = ['game_id', 'name', 'genre', 'description', 'size', 'esrb_rating', 'developer']
	let games = []

	for (let index = 0; index < NUM_GAMES; index++) {
		games.push([
			index,
			faker.commerce.productName(),
			faker.music.genre(),
			faker.commerce.productDescription(),
			Math.random() * 1E9,
			faker.helpers.arrayElement(['E', 'E10', 'T', 'M']),
			faker.company.name()
		])
	}

	await fs.writeFile("csv_data/Game.csv", csv(game_labels, games))

	const supplier_labels = ['supplier_id', 'name', 'address']
	let suppliers = []

	for (let index = 0; index < NUM_SUPPLIERS; index++) {
		suppliers.push([
			index,
			faker.company.name(),
			faker.address.streetAddress()
		])
	}

	await fs.writeFile("csv_data/Supplier.csv", csv(supplier_labels, suppliers))

	const supply_labels = ['game_id', 'supplier_id', 'price']
	let supply = []
	let suppliers_per_game = {}

	for (let game_id = 0; game_id < NUM_GAMES; game_id++) {
		suppliers_per_game[game_id] = []
		let supplier_ids = Array(NUM_SUPPLIERS).fill().map((_, index) => index + 1);
		for (let supplier in (faker.helpers.shuffle(supplier_ids).slice(0, NUM_SUPPLIERS_PER_GAME))) {
			supply.push([
				game_id,
				supplier,
				Math.random() * 100 * 100
			])
			suppliers_per_game[game_id].push(supplier)
		}
	}

	await fs.writeFile("csv_data/Supply.csv", csv(supply_labels, supply))

	const customer_labels = ['customer_id', 'first_name', 'last_name', 'age', 'password']
	let customer = []

	for (let customer_id = 0; customer_id < NUM_CUSTOMERS; customer_id++) {
		customer.push([
			customer_id,
			faker.name.firstName(),
			faker.name.lastName(),
			Math.floor(Math.random() * 50 + 13),
			faker.internet.password()
		])
	}

	await fs.writeFile("csv_data/Customer.csv", csv(customer_labels, customer))

	const payment_method_labels = ['payment_id', 'customer_id', 'card_number', 'exp_date']
	let payment_method = []
	let payment_methods_per_customer = []

	var payment_id = 0
	for (let customer_id = 0; customer_id < NUM_CUSTOMERS; customer_id++) {
		payment_methods_per_customer[customer_id] = []
		let payment_method_count = Math.floor(Math.random() * 1.5 + 1)
		for (let i=0; i<payment_method_count; i++) {
			let exp_month = String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')
			let exp_year = String(Math.floor(Math.random() * 100)).padStart(2, '0')
			payment_method.push([
				payment_id++,
				customer_id,
				faker.finance.creditCardNumber("################"),
				exp_month + '/' + exp_year
			])
			payment_methods_per_customer[customer_id].push(payment_id - 1)
		}
	}

	await fs.writeFile("csv_data/Payment_Method.csv", csv(payment_method_labels, payment_method))

	const review_labels = ['game_id', 'customer_id', 'comment', 'score']
	let review = []

	for (let customer_id = 0; customer_id < NUM_CUSTOMERS; customer_id++) {
		const review_count = Math.floor(Math.random() * 4)
		for (let i=0; i<review_count; i++) {
			const game_id = Math.floor(Math.random() * NUM_GAMES)
			review.push([
				game_id,
				customer_id,
				faker.lorem.sentence().slice(0, 512),
				Math.floor(Math.random() * 11)
			])
		}
	}

	await fs.writeFile("csv_data/Review.csv", csv(review_labels, review))

	const game_order_labels = ['date', 'game_id', 'supplier_id', 'customer_id', 'payment_id']
	let game_order = []

	for (let customer_id = 0; customer_id < NUM_CUSTOMERS; customer_id++) {
		for (let i=0; i<NUM_ORDERS_PER_CUSTOMER; i++) {
			const order_date = faker.date.past(20)
			const date_string = String(order_date.getFullYear()) + '-' + String(order_date.getMonth() + 1).padStart(2, '0') + '-' + String(order_date.getDate()).padStart(2, '0')
			const game_id = Math.floor(Math.random() * NUM_GAMES)
			const supplier_id = faker.helpers.arrayElement(suppliers_per_game[game_id])
			const payment_id = faker.helpers.arrayElement(payment_methods_per_customer[customer_id])
			game_order.push([
				date_string,
				game_id,
				supplier_id,
				customer_id,
				payment_id
			])
		}
	}

	await fs.writeFile("csv_data/Game_Order.csv", csv(game_order_labels, game_order))

}

main()