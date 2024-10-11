const Order = require("../models/order");
const Employee = require("../models/employee");
const Drink = require("../models/Drinks");
const moment = require("moment");

exports.addOrderForEmployee = async (req, res) => {
  try {
    const { employeeName, drinks, date } = req.body;

    // Step 1: Validate input
    if (!employeeName || !drinks || !date) {
      return res
        .status(400)
        .json({ msg: "Please provide employeeName, drinks, and date." });
    }

    if (!Array.isArray(drinks) || drinks.length === 0) {
      return res
        .status(400)
        .json({ msg: "Please provide at least one drink." });
    }

    // Ensure the employee exists
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(400).json({ msg: "Employee not found" });
    }

    // Fetch all drinks concurrently using drink IDs (better performance)
    const drinkIds = drinks.map((drink) => drink.drinkId);
    const drinksData = await Drink.find({ _id: { $in: drinkIds } });

    if (drinksData.length !== drinks.length) {
      return res.status(400).json({ msg: "Some drinks were not found" });
    }

    // Create drinks array with prices
    const drinksWithPrices = drinks.map((drink) => {
      const drinkData = drinksData.find((d) => d._id.equals(drink.drinkId));

      if (!drink.quantity || drink.quantity <= 0) {
        throw new Error(`Invalid quantity for drink: ${drinkData.name}`);
      }

      return {
        drinkId: drinkData._id,
        name: drinkData.name,
        quantity: drink.quantity,
        price: drinkData.price * drink.quantity,
      };
    });

    const order = new Order({
      employee: employee._id,
      drinks: drinksWithPrices,
      date: moment(date, "DD-MM-YYYY").toDate(), // Using moment for date handling
      paid: false,
    });
    if (!order) {
      return res.status(400).json({ msg: "err and order not created!!" });
    } else {
      await order.save();
    }

    // Populate the employee name and drink names after saving
    const populatedOrder = await Order.findById(order._id)
      .populate("employee", "name role") // Populate employee name
      .populate("drinks.drinkId", "name"); // Populate drink name

    res
      .status(201)
      .json({ msg: "Order added successfully", data: populatedOrder });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Remove Order for employee's order
exports.removeOrderForEmployee = async (req, res) => {
  try {
    const { employeeName, orderId } = req.body;

    // Ensure the employee exists
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const orders = await Order.findOneAndDelete({
      _id: orderId,
      employee: employee._id,
    });

    if (!orders) {
      return res.status(404).json({
        msg: `No order found for ${employeeName} with the given order ID : `,
      });
    }

    res.status(200).json({ msg: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Remove a specific drink from an employee's order based on employee name, drink ID, and date
exports.removeSpecificDrinkFromOrder = async (req, res) => {
  try {
    const { employeeName, drinkId, date } = req.body;

    // Validate input
    if (!employeeName || !drinkId || !date) {
      return res
        .status(400)
        .json({ msg: "Please provide employeeName, drinkId, and date." });
    }

    // Find the employee by name
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    // Convert the date to a valid format
    const parsedDate = moment(date, "DD-MM-YYYY").toDate();

    // Find the order that matches the employee ID and date
    const order = await Order.findOne({
      employee: employee._id,
      date: { $eq: parsedDate }, // Match exact date
      paid: false, // Only consider unpaid orders
    });

    if (!order) {
      return res.status(404).json({
        msg: "No unpaid order found for this employee on the specified date.",
      });
    }

    // Find the drink in the order to remove
    const drinkToRemoveIndex = order.drinks.findIndex((drink) =>
      drink.drinkId.equals(drinkId)
    );
    if (drinkToRemoveIndex === -1) {
      return res
        .status(404)
        .json({ msg: "Drink not found in the specified order." });
    }

    // Remove the drink from the order
    order.drinks.splice(drinkToRemoveIndex, 1);

    // Save the updated order
    await order.save();

    res.status(200).json({
      msg: `Drink was successfully removed from the order.`,
      order, // Optionally return the updated order
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Admin retrieves bill for an employee (continued)
exports.getBillForEmployee = async (req, res) => {
  try {
    const { employeeName, startDate, endDate } = req.body;

    // Validate input
    if (!employeeName || !startDate || !endDate) {
      return res
        .status(400)
        .json({ msg: "Please provide employeeName, startDate, and endDate." });
    }

    const start = moment(startDate, "DD-MM-YYYY").startOf("day").toDate();
    const end = moment(endDate, "DD-MM-YYYY").endOf("day").toDate();

    // const start = dayjs(startDate, "DD-MM-YYYY").startOf("day").toDate();
    // const end = dayjs(endDate, "DD-MM-YYYY").endOf("day").toDate();

    // Find employee by name
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res
        .status(404)
        .json({ msg: `Employee named : ${employeeName} not found.` });
    }

    // Find unpaid orders within the date range for this employee
    const orders = await Order.find({
      employee: employee._id,
      date: { $gte: start, $lte: end },
      paid: false, // Only retrieve unpaid orders
    })
      .populate("employee", "role") // Populate employee details
      .populate("drinks.drinkId", "name"); // Populate drink names

    // Handle no orders found
    if (!orders.length) {
      return res
        .status(404)
        .json({ msg: `No unpaid orders found for ${employeeName}.` });
    }

    // Calculate total bill
    let totalBill = 0;
    orders.forEach((order) => {
      order.drinks.forEach((drink) => {
        totalBill += drink.price; // Total cost per drink
      });
    });

    // Send the bill response
    res.status(200).json({
      employee: employee.name,
      totalBill,
      orders, // Return unpaid orders for potential further processing
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Admin marks all bills for an employee as paid and removes them
exports.markBillAsPaidAndRemoveOrders = async (req, res) => {
  try {
    const { employeeName } = req.body;

    // Find the employee by name
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    // Find unpaid orders for this employee
    const unpaidOrders = await Order.find({
      employee: employee._id,
      paid: false,
    });

    if (!unpaidOrders.length) {
      return res
        .status(404)
        .json({ msg: "No unpaid orders found for this employee" });
    }

    // Mark all unpaid orders as paid
    await Order.updateMany(
      { employee: employee._id, paid: false },
      { $set: { paid: true } }
    );

    // Remove all paid orders for this employee
    await Order.deleteMany({ employee: employee._id, paid: true });

    // Response: All orders marked as paid and removed
    res.status(200).json({
      msg: `All unpaid orders have been marked as paid and removed for : ${employeeName}.`,
    });
  } catch (err) {
    res.status(500).send({ msg: "Server Error", erroe: err.massege });
  }
};
