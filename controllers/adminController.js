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

    const getPriceByRole = (role, drink) => {
      switch (role) {
        case "union":
          return drink.unionPrice;
        case "DENTISTRY":
          return drink.dentistryPrice;
        default:
          return drink.price;
      }
    };
    // Create drinks array with prices
    let totalOrdersPrice = 0;
    const drinksWithPrices = drinks.map((drink) => {
      const drinkData = drinksData.find((d) => d._id.equals(drink.drinkId));

      if (!drink.quantity || drink.quantity <= 0) {
        throw new Error(`Invalid quantity for drink: ${drinkData.name}`);
      }

      const price = getPriceByRole(employee.role, drinkData);
      const drinkTotalPrice = price * drink.quantity;
      totalOrdersPrice += drinkTotalPrice;

      return {
        drinkId: drinkData._id,
        name: drinkData.name,
        quantity: drink.quantity,
        price,
        totalPrice: drinkTotalPrice,
      };
    });

    const order = new Order({
      employee: employee._id,
      drinks: drinksWithPrices,
      totalOrdersPrice,
      date: moment.utc(date, "DD-MM-YYYY").toDate(),
      paid: false,
    });
    await order.save();

    // Populate the employee name and drink names after saving
    const populatedOrder = await Order.findById(order._id)
      .populate("employee", "name role")
      .populate("drinks.drinkId", "name");

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
    const parsedDate = moment.utc(date, "DD-MM-YYYY").toDate();

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

    if (!employeeName || !startDate || !endDate) {
      return res
        .status(400)
        .json({ msg: "Please provide employeeName, startDate, and endDate." });
    }

    const start = moment.utc(startDate, "DD-MM-YYYY").startOf("day").toDate();
    const end = moment.utc(endDate, "DD-MM-YYYY").endOf("day").toDate();

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
      paid: false,
    })
      .populate("employee", "role")
      .populate("drinks.drinkId", "name");

    // Handle no orders found
    if (!orders.length) {
      return res
        .status(404)
        .json({ msg: `No unpaid orders found for ${employeeName}.` });
    }

    // Calculate total bill
    let totalBill = 0;
    orders.forEach((order) => {
      totalBill += order.totalOrdersPrice;
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

exports.partialPay = async (req, res) => {
  try {
    const { employeeName, startDate, endDate } = req.body;

    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    const unpaidOrders = await Order.find({
      employee: employee._id,
      paid: false,
      date: { $gte: fromDate, $lte: toDate },
    });

    if (!unpaidOrders.length) {
      return res.status(404).json({
        msg: "No unpaid orders found for this employee within the specified period",
      });
    }

    await Order.updateMany(
      {
        employee: employee._id,
        paid: false,
        date: { $gte: fromDate, $lte: toDate },
      },
      { $set: { paid: true } }
    );

    await Order.deleteMany({
      employee: employee._id,
      paid: true,
      date: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({
      msg: `All unpaid orders between ${fromDate} and ${endDate} have been marked as paid and removed for : ${employeeName}.`,
    });
  } catch (err) {
    res.status(500).send({ msg: "Server Error", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$employee",
          totalBillPrice: { $sum: "$totalOrdersPrice" },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $unwind: "$employee",
      },
      {
        $project: {
          _id: 0,
          employeeName: "$employee.name",
          totalBillPrice: 1,
        },
      },
      {
        $sort: {
          employeeName: 1,
        },
      },
      {
        $group: {
          _id: null,
          employees: { $push: "$$ROOT" },
          finalTotal: { $sum: "$totalBillPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          employees: 1,
          finalTotal: 1,
        },
      },
    ]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ msg: "No orders found", data: [] });
    }

    return res
      .status(200)
      .json({ msg: "Employees All Bills", data: orders[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getAllBillForEmployee = async (req, res) => {
  try {
    const { employeeName } = req.param;

    if (!employeeName) {
      return res.status(400).json({ msg: "Please provide employeeName." });
    }
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res
        .status(404)
        .json({ msg: `Employee named : ${employeeName} not found.` });
    }

    const orders = await Order.find({
      employee: employee._id,
      paid: false,
    })
      .populate("employee", "role")
      .populate("drinks.drinkId", "name");

    if (!orders.length) {
      return res
        .status(404)
        .json({ msg: `No unpaid orders found for ${employeeName}.` });
    }

    let totalBill = 0;
    orders.forEach((order) => {
      totalBill += order.totalOrdersPrice;
    });

    res.status(200).json({
      employee: employee.name,
      totalBill,
      orders,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.updateSpecificDrink = async (req, res) => {
  try {
    const { orderId, drinkId, newQuantity } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const drinkIndex = order.drinks.findIndex(
      (d) => d.drinkId._id.toString() === drinkId
    );
    if (drinkIndex === -1)
      return res.status(404).json({ message: "Drink not found in order" });

    order.drinks[drinkIndex].quantity = newQuantity;
    order.totalOrdersPrice = order.drinks.reduce(
      (sum, d) => sum + d.quantity * d.price,
      0
    );

    await order.save();
    res.json({ message: "Drink quantity updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.RemoveSpecificDrink = async (req, res) => {
  try {
    const { orderId, drinkId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.drinks = order.drinks.filter(
      (d) => d.drinkId._id.toString() !== drinkId
    );
    order.totalOrdersPrice = order.drinks.reduce(
      (sum, d) => sum + d.quantity * d.price,
      0
    );

    if (order.drinks.length === 0) {
      await Order.findByIdAndDelete(orderId);
      return res.json({ message: "Order deleted as it had no drinks left" });
    }

    await order.save();
    res.json({ message: "Drink removed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
