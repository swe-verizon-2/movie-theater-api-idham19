const express = require("express");
const { Show, User } = require("../models");
// const {User} = require("../models/index");
const { check, validationResult } = require("express-validator");

const route = express.Router();

route.get("/", async (req, res, next) => {
  try {
    const getAllUsers = await User.findAll({ include: Show });
    res.json(getAllUsers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
route.get("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const findUserById = await User.findByPk(userId);
    res.status(200).json(findUserById);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Get user by id and all shows he watched
route.get("/:id/shows", async(req, res, next) => {
  try {
    const userId= req.params.id
    const findUser= await User.findByPk(userId,{include:Show})
    res.json(findUser)
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Post request to create a new User
route.post(
  "/",
  [check("showId").not().isEmpty().trim().withMessage("ShowIds is required")],
  [
    check("username")
      .not()
      .isEmpty()
      .trim()
      .withMessage("username is required"),
  ],
  [
    check("password")
      .not()
      .isEmpty()
      .trim()
      .withMessage("password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }

      const { username, password, showId } = req.body; //

      // Create the User instance
      const newUser = await User.create({
        username: username,
        password: password,
      });

      // Find all Shows by their ids
      const shows = await Show.findAll({
        where: {
          id: showId,
        },
      });

      if (shows.length !== showId.length) {
        return res.status(404).json({ error: "One or more show not found" });
      }

      await newUser.addShows(shows); // Using addShows for many-to-many association

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

//Put Method
route.put(
  "/:id",
  [check("showId").not().isEmpty().trim().withMessage("ShowIds is required")],
  [
    check("username")
      .not()
      .isEmpty()
      .trim()
      .withMessage("username is required")
      .isEmail()
      .withMessage("username should be an email"),
  ],
  [
    check("password")
      .not()
      .isEmpty()
      .trim()
      .withMessage("password is required"),
  ],
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const findUserId = await User.findByPk(userId, { include: Show });
      await findUserId.update(userData);
      res.json(findUserId);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
route.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const findUser = await User.findByPk(userId);
    await findUser.destroy();
    const allUsers = await User.findAll({ include: Show });
    res.json(allUsers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = route;
