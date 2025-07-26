const db = require('../config/db');

class AddressModel {
  // Get all addresses for a customer
  static async getCustomerAddresses(customerId) {
    try {
      const [addresses] = await db.query(
        'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
        [customerId]
      );
      return addresses;
    } catch (error) {
      console.error('Error getting customer addresses:', error);
      throw error;
    }
  }

  // Get address by ID
  static async getAddressById(addressId, customerId) {
    try {
      const [addresses] = await db.query(
        'SELECT * FROM customer_addresses WHERE id = ? AND customer_id = ?',
        [addressId, customerId]
      );
      return addresses[0] || null;
    } catch (error) {
      console.error('Error getting address by ID:', error);
      throw error;
    }
  }

  // Add new address
  static async addAddress(customerId, addressData) {
    try {
      const {
        name,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        landmark,
        address_type = 'home',
        is_default = false
      } = addressData;

      // If this is set as default, remove default from other addresses
      if (is_default) {
        await db.query(
          'UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = ?',
          [customerId]
        );
      }

      const [result] = await db.query(
        `INSERT INTO customer_addresses (
          customer_id, name, phone, address_line_1, address_line_2, 
          city, state, pincode, landmark, address_type, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, name, phone, address_line_1, address_line_2, city, state, pincode, landmark, address_type, is_default]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  // Update address
  static async updateAddress(addressId, customerId, addressData) {
    try {
      const {
        name,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        landmark,
        address_type,
        is_default
      } = addressData;

      // If this is set as default, remove default from other addresses
      if (is_default) {
        await db.query(
          'UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = ? AND id != ?',
          [customerId, addressId]
        );
      }

      const [result] = await db.query(
        `UPDATE customer_addresses SET 
          name = ?, phone = ?, address_line_1 = ?, address_line_2 = ?, 
          city = ?, state = ?, pincode = ?, landmark = ?, address_type = ?, is_default = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND customer_id = ?`,
        [name, phone, address_line_1, address_line_2, city, state, pincode, landmark, address_type, is_default, addressId, customerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  static async deleteAddress(addressId, customerId) {
    try {
      const [result] = await db.query(
        'DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?',
        [addressId, customerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Set default address
  static async setDefaultAddress(addressId, customerId) {
    try {
      // Remove default from all addresses
      await db.query(
        'UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = ?',
        [customerId]
      );

      // Set new default
      const [result] = await db.query(
        'UPDATE customer_addresses SET is_default = TRUE WHERE id = ? AND customer_id = ?',
        [addressId, customerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  // Get default address
  static async getDefaultAddress(customerId) {
    try {
      const [addresses] = await db.query(
        'SELECT * FROM customer_addresses WHERE customer_id = ? AND is_default = TRUE',
        [customerId]
      );
      return addresses[0] || null;
    } catch (error) {
      console.error('Error getting default address:', error);
      throw error;
    }
  }

  // Format address for display
  static formatAddress(address) {
    if (!address) return '';
    
    let formatted = `${address.name}, ${address.phone}\n`;
    formatted += `${address.address_line_1}`;
    if (address.address_line_2) {
      formatted += `, ${address.address_line_2}`;
    }
    if (address.landmark) {
      formatted += `, Near ${address.landmark}`;
    }
    formatted += `\n${address.city}, ${address.state} - ${address.pincode}`;
    
    return formatted;
  }
}

module.exports = AddressModel;
