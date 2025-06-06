const pool = require("../database/");

async function getClassifications() {
  try {
    return await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error; // Let controller handle
  }
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

async function getInventoryItemById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
       WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryItemById error:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById
};