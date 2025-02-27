import express from "express";
import Car from "../models/Car.js";
import jwt from "jsonwebtoken";
import upload from "../utils/update.js"; 

const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Add a New Car Listing
router.post("/add", authenticate, upload.single("image"), async (req, res) => {
    try {
  
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
  
      const { make, model, year, price, mileage, location, description } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`; // Correct image path
  
      const car = new Car({
        user: req.user.userId,
        make,
        model,
        year,
        price,
        mileage,
        location,
        description,
        image: imageUrl,
      });
  
      await car.save();
      res.status(201).json({ message: "Car listed successfully", car });
    } catch (error) {
      console.error("Error adding car:", error);
      res.status(500).json({ message: "Error adding car" });
    }
  });
  

  

// Get All Cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find().populate("user", "name email");
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars" });
  }
});

// Get a Single Car by ID
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("user", "name email");
    if (!car) return res.status(404).json({ message: "Car not found" });

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car details" });
  }
});

// Update a Car Listing (Only Owner Can Update)
router.put("/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // if (car.user.toString() !== req.user.userId) {
    //   return res.status(403).json({ message: "Unauthorized to update this car" });
    // }

    const { make, model, year, price, mileage, location, description } = req.body;
    if (req.file) car.image = req.file.path;

    car.make = make || car.make;
    car.model = model || car.model;
    car.year = year || car.year;
    car.price = price || car.price;
    car.mileage = mileage || car.mileage;
    car.location = location || car.location;
    car.description = description || car.description;

    await car.save();
    res.json({ message: "Car updated successfully", car });
  } catch (error) {
    res.status(500).json({ message: "Error updating car" });
  }
});

// Delete a Car Listing (Only Owner Can Delete)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this car" });
    }

    await car.deleteOne();
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car" });
  }
});

export default router;
