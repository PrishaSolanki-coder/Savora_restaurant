const categoryModel = require('../models/categoryModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.getAll();
  sendSuccess(res, 200, 'Categories retrieved.', categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.create(req.body);
  sendSuccess(res, 201, 'Category created.', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const existing = await categoryModel.getById(req.params.id);
  if (!existing) return sendError(res, 404, 'Category not found.');
  const category = await categoryModel.update(req.params.id, req.body);
  sendSuccess(res, 200, 'Category updated.', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const existing = await categoryModel.getById(req.params.id);
  if (!existing) return sendError(res, 404, 'Category not found.');

  const inUse = await categoryModel.hasMenuItems(req.params.id);
  if (inUse) {
    return sendError(res, 400, 'Cannot delete a category that still has menu items assigned to it.');
  }

  await categoryModel.remove(req.params.id);
  sendSuccess(res, 200, 'Category deleted.');
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
