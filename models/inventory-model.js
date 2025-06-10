const pool = require("../database/");

async function getClassifications() {
  try {
    return await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_description,
              i.inv_image, i.inv_thumbnail, i.inv_price, i.inv_miles, i.inv_color,
              c.classification_name 
       FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1
       ORDER BY i.inv_make, i.inv_model`,
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
      `SELECT i.*, c.classification_name
       FROM public.inventory AS i
       JOIN public.classification AS c
         ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryItemById error:", error);
    throw error;
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
}

async function addInventoryItem(inventoryData) {
  try {
    const sql = `INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_miles, 
      inv_color, classification_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    
    return await pool.query(sql, [
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail,
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.classification_id
    ]);
  } catch (error) {
    console.error("addInventoryItem error:", error);
    throw error;
  }
}

async function updateInventoryItem(inventoryData) {
  try {
    const sql = `UPDATE inventory SET
      inv_make = $1,
      inv_model = $2,
      inv_year = $3,
      inv_description = $4,
      inv_image = $5,
      inv_thumbnail = $6,
      inv_price = $7,
      inv_miles = $8,
      inv_color = $9,
      classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;
    
    const params = [
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail,
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.classification_id,
      inventoryData.inv_id
    ];

    console.log('Update params:', params); // Debug logging
    return await pool.query(sql, params);
  } catch (error) {
    console.error("updateInventoryItem error:", error);
    throw error;
  }
}

async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("deleteInventoryItem error:", error);
    throw new Error("Delete Inventory Error");
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById,
  addClassification,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};