const User = require("../models/User");
const Airline = require("../models/Airline");

const createAirline = async (req, res) => {
  const { name, code } = req.body;

  try {
    const airlineExists = await Airline.findOne({ code });

    if (airlineExists) {
      return res.status(400).json({ message: "Airline already exists" });
    }

    const airline = await Airline.create({
      name,
      code,
      admins: [req.user._id],
    });

    res.status(201).json(airline);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAirlines = async (req, res) => {
  try {
    const airlines = await Airline.find();
    res.json(airlines);
  } catch (error) {
    //res.status(500).json({message: 'Server error'});
    console.error("❌ Error in getAirlines:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAirlineById = async (req, res) => {
  try {
    const airline = await Airline.findById(req.params.id).populate(
      "admins",
      "name email"
    );

    if (airline) {
      res.json(airline);
    } else {
      res.status(404).json({ message: "Airline not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const inviteEmployee = async (req, res) => {
  const { userId, airlineId } = req.body;

  try {
    const inviter = req.user;
    const userToInvite = await User.findById(userId);
    const airline = await Airline.findById(airlineId);

    if (!userToInvite || !airline) {
      return res.status(404).json({ message: "User or Airline not found" });
    }

    const isAdmin = inviter.roles.includes("admin");
    const isEmployeeOfAirline =
      inviter.roles.includes("employee") &&
      inviter.airlines.includes(airlineId);

    if (!isAdmin && !isEmployeeOfAirline) {
      return res.status(404).json({ message: "Not authorized" });
    }

    if (!userToInvite.airlines.includes(airlineId)) {
      userToInvite.airlines.push(airlineId);
    }

    if (userToInvite.roles.includes("customer")) {
      userToInvite.roles.push("employee");
    }

    await userToInvite.save();
    res.status(200).json({ message: "Invitation successful" });
  } catch (error) {
    // res.status(500).json({ message: 'Server error' });
    console.error("❌ Error in inviteEmployee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester.roles.includes("admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const airlinesWithEmployees = await Airline.aggregate([
      { $project: { name: 1, code: 1 } },

      {
        $lookup: {
          from: "users",
          let: { airlineId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$airlineId", "$airlines"] },
                    { $in: ["employee", "$roles"] },
                  ],
                },
              },
            },

            { $project: { name: 1, surname: 1, email: 1 } },

            { $sort: { surname: 1, name: 1 } },
          ],
          as: "employees",
        },
      },

      { $project: { name: 1, code: 1, employees: 1 } },
    ]);

    return res.json(airlinesWithEmployees);
  } catch (error) {
    console.error("❌ Error in getAllEmployees:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getEmployeesByAirline = async (req, res) => {
  const { airlineId } = req.params;

  try {
    const requester = req.user;

    const isAdmin = requester.roles.includes("admin");
    const isEmployeeOfAirline =
      requester.roles.includes("employee") &&
      requester.airlines.includes(airlineId);

    if (!isAdmin && !isEmployeeOfAirline) {
      return res.status(403).json({ message: "Access denied" });
    }

    const employees = await User.find({
      roles: "employee",
      airlines: airlineId,
    }).select("name surname email");

    res.json(employees);
  } catch (error) {
    console.error("❌ Error in getEmployeesByAirline:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAirline,
  getAirlines,
  getAirlineById,
  inviteEmployee,
  getAllEmployees,
  getEmployeesByAirline,
};
