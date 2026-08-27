// Order item logic lives inside orderModel.js (createOrder/addOrderItem run
// together inside one DB transaction). This file re-exports those pieces
// so the folder structure matches the rest of the project's conventions.
const { addOrderItem } = require('./orderModel');
module.exports = { addOrderItem };
