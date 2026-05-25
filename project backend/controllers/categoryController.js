import Category from "../model/categoryModel.js";

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    return res.json({
      success: true,
      message: "Category created",
      data: category,
    });

  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    return res.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

export const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    return res.json({
      success: true,
      data: category,
    });

  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

export const UpdateCatogory = async (req, res) => {
  try {

    await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const UpdateCatogory = await Category.findByPk(req.params.id);

    return res.json({
      success: true,
      message: "Category updated successfully",
      data: UpdateCatogory,
    });

  } catch (error) {

    return res.json({
      success: false,
      error: error.message,
    });

  }
};

export const destroyCategory = async (req, res) => {
  try {

    await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {

    return res.json({
      success: false,
      error: error.message,
    });

  }
};