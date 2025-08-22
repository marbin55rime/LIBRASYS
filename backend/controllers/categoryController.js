import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Add a new category
// @route   POST /api/categories
// @access  Private (Admin)
const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  const category = await Category.create({ name });

  res.status(201).json(category);
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findById(id);

  if (category) {
    // Check if new name already exists for another category
    const categoryExists = await Category.findOne({ name });
    if (categoryExists && categoryExists._id.toString() !== id) {
      res.status(400);
      throw new Error('Category with this name already exists');
    }

    category.name = name || category.name;
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (category) {
    await category.deleteOne();
    res.status(200).json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Get total number of categories
// @route   GET /api/categories/count
// @access  Private (Admin)
const getTotalCategories = asyncHandler(async (req, res) => {
  try {
    const count = await Category.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: `Error fetching category count: ${error.message}` });
  }
});

export { addCategory, getCategories, updateCategory, deleteCategory, getTotalCategories };