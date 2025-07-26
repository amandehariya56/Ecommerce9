const AddressModel = require('../models/addressModel');
const sendResponse = require('../utils/sendResponse');

const addressController = {
  // Get all customer addresses
  getAddresses: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const addresses = await AddressModel.getCustomerAddresses(customerId);
      
      sendResponse(res, 200, true, "Addresses retrieved successfully", addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      sendResponse(res, 500, false, "Failed to get addresses");
    }
  },

  // Get address by ID
  getAddressById: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const addressId = req.params.addressId;

      const address = await AddressModel.getAddressById(addressId, customerId);
      
      if (!address) {
        return sendResponse(res, 404, false, "Address not found");
      }

      sendResponse(res, 200, true, "Address retrieved successfully", address);
    } catch (error) {
      console.error("Get address by ID error:", error);
      sendResponse(res, 500, false, "Failed to get address");
    }
  },

  // Add new address
  addAddress: async (req, res) => {
    try {
      const customerId = req.customer.id;
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
      } = req.body;

      // Validation
      if (!name || !phone || !address_line_1 || !city || !state || !pincode) {
        return sendResponse(res, 400, false, "Required fields: name, phone, address_line_1, city, state, pincode");
      }

      // Validate pincode format
      if (!/^\d{6}$/.test(pincode)) {
        return sendResponse(res, 400, false, "Invalid pincode format");
      }

      // Validate phone format
      if (!/^\d{10}$/.test(phone)) {
        return sendResponse(res, 400, false, "Invalid phone number format");
      }

      const addressId = await AddressModel.addAddress(customerId, {
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
      });

      sendResponse(res, 201, true, "Address added successfully", { addressId });
    } catch (error) {
      console.error("Add address error:", error);
      sendResponse(res, 500, false, "Failed to add address");
    }
  },

  // Update address
  updateAddress: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const addressId = req.params.addressId;
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
      } = req.body;

      // Check if address exists
      const existingAddress = await AddressModel.getAddressById(addressId, customerId);
      if (!existingAddress) {
        return sendResponse(res, 404, false, "Address not found");
      }

      // Validation
      if (!name || !phone || !address_line_1 || !city || !state || !pincode) {
        return sendResponse(res, 400, false, "Required fields: name, phone, address_line_1, city, state, pincode");
      }

      // Validate pincode format
      if (!/^\d{6}$/.test(pincode)) {
        return sendResponse(res, 400, false, "Invalid pincode format");
      }

      // Validate phone format
      if (!/^\d{10}$/.test(phone)) {
        return sendResponse(res, 400, false, "Invalid phone number format");
      }

      const success = await AddressModel.updateAddress(addressId, customerId, {
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
      });

      if (!success) {
        return sendResponse(res, 400, false, "Failed to update address");
      }

      sendResponse(res, 200, true, "Address updated successfully");
    } catch (error) {
      console.error("Update address error:", error);
      sendResponse(res, 500, false, "Failed to update address");
    }
  },

  // Delete address
  deleteAddress: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const addressId = req.params.addressId;

      const success = await AddressModel.deleteAddress(addressId, customerId);
      
      if (!success) {
        return sendResponse(res, 404, false, "Address not found");
      }

      sendResponse(res, 200, true, "Address deleted successfully");
    } catch (error) {
      console.error("Delete address error:", error);
      sendResponse(res, 500, false, "Failed to delete address");
    }
  },

  // Set default address
  setDefaultAddress: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const addressId = req.params.addressId;

      // Check if address exists
      const address = await AddressModel.getAddressById(addressId, customerId);
      if (!address) {
        return sendResponse(res, 404, false, "Address not found");
      }

      const success = await AddressModel.setDefaultAddress(addressId, customerId);
      
      if (!success) {
        return sendResponse(res, 400, false, "Failed to set default address");
      }

      sendResponse(res, 200, true, "Default address set successfully");
    } catch (error) {
      console.error("Set default address error:", error);
      sendResponse(res, 500, false, "Failed to set default address");
    }
  },

  // Get default address
  getDefaultAddress: async (req, res) => {
    try {
      const customerId = req.customer.id;
      const address = await AddressModel.getDefaultAddress(customerId);
      
      sendResponse(res, 200, true, "Default address retrieved successfully", address);
    } catch (error) {
      console.error("Get default address error:", error);
      sendResponse(res, 500, false, "Failed to get default address");
    }
  }
};

module.exports = addressController;
