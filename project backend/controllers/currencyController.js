import Currency from "../model/currencyModel.js";

// CREATE
export const createCurrency = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const currency = await Currency.create(req.body);

    return res.json({
      success: true,
      message: "Currency created",
      data: currency,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// GET ALL
export const getCurrencies = async (req, res) => {
  try {
    const data = await Currency.findAll();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

// GET SINGLE
export const getCurrency = async (req, res) => {
  try {
    const currency = await Currency.findByPk(req.params.id);
    return res.json(currency);
  } catch (error) {
    return res.json({ error: error.message });
  }
};

// UPDATE
export const updateCurrency = async (req, res) => {
  try {
    await Currency.update(req.body, {
      where: { id: req.params.id },
    });

    return res.json({ message: "Currency updated" });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

// DELETE
export const deleteCurrency = async (req, res) => {
  try {
    await Currency.destroy({
      where: { id: req.params.id },
    });

    return res.json({ message: "Currency deleted" });
  } catch (error) {
    return res.json({ error: error.message });
  }
};