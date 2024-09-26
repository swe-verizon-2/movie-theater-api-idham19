const express = require("express");
const { Show, User } = require("../models");
// const {User} = require("../models/index");
const { check, validationResult } = require("express-validator");

const route = express.Router();

route.get("/", async (req, res, next) => {
  try {
    const { genre } = req.query;
    let getAllShows;
    if (genre) {
      // If genre is provided, filter shows by genre
      getAllShows = await Show.findAll({
        where: {
          genre: genre,
        },
        include: User, // Include associated users if needed
      });
    } else {
      getAllShows = await Show.findAll({ include: User });
    }
    res.status(200).json(getAllShows);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

route.get("/:id", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const findShowById = await Show.findByPk(showId, { include: User });
    res.status(200).json(findShowById);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Post request to create a new User
route.post(
  "/",
  [check("userId").not().isEmpty().trim().withMessage("userIds is required")],
  [check("title").not().isEmpty().trim().withMessage("title is required").isLength({min:1,max:25}).withMessage("title lenght should be max 25 characters")],
  [check("genre").not().isEmpty().trim().withMessage("genre is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }

      const { title, genre, rating, userId } = req.body; //

      // Create the User instance
      const newShow = await Show.create({
        title: title,
        genre: genre,
        rating: rating || 0, // Use rating from body, default to 0 if not provided
      });

      // Find all Shows by their ids
      const users = await User.findAll({
        where: {
          id: userId,
        },
      });

      if (users.length !== userId.length) {
        return res.status(404).json({ error: "One or more User not found" });
      }

      await newShow.addUsers(users); // Using addUsers for many-to-many association

      res.status(201).json(newShow);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

//Put Method
route.put(
  "/:id",
  [check("userId").not().isEmpty().trim().withMessage("userIds is required")],
  [check("title").not().isEmpty().trim().withMessage("title is required")],
  [check("genre").not().isEmpty().trim().withMessage("genre is required")],
  async (req, res, next) => {
    try {
      const showId = req.params.id;
      const showData = req.body;
      const findShowById = await Show.findByPk(showId, { include: User });
      await findShowById.update(showData);
      res.json(findShowById);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

route.delete("/:id", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const findShow = await Show.findByPk(showId);
    await findShow.destroy();
    const allShows = await Show.findAll({ include: User });
    res.json(allShows);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = route;
