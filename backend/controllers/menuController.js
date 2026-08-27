const menuModel = require('../models/menuModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// GET /api/menu  (supports ?category=&search=&veg=veg|nonveg&sort=price_asc|price_desc|popular)
const getMenu = asyncHandler(async (req, res) => {
  const { category, search, veg, sort } = req.query;
  const items = await menuModel.getAll({ category, search, veg, sort });
  sendSuccess(res, 200, 'Menu retrieved successfully.', items);
});

// GET /api/menu/:id
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await menuModel.getById(req.params.id);
  if (!item) return sendError(res, 404, 'Menu item not found.');

  const related = await menuModel.getRelated(item.category_id, item.id);
  sendSuccess(res, 200, 'Menu item retrieved.', { item, related });
});

// POST /api/menu (admin)
const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuModel.create(req.body);
  sendSuccess(res, 201, 'Menu item created.', item);
});

// PUT /api/menu/:id (admin)
const updateMenuItem = asyncHandler(async (req, res) => {
  const existing = await menuModel.getById(req.params.id);
  if (!existing) return sendError(res, 404, 'Menu item not found.');
  const item = await menuModel.update(req.params.id, req.body);
  sendSuccess(res, 200, 'Menu item updated.', item);
});

// DELETE /api/menu/:id (admin)
const deleteMenuItem = asyncHandler(async (req, res) => {
  const existing = await menuModel.getById(req.params.id);
  if (!existing) return sendError(res, 404, 'Menu item not found.');
  await menuModel.remove(req.params.id);
  sendSuccess(res, 200, 'Menu item deleted.');
});

module.exports = { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };
