const db = require("../config/db");

exports.addWebsite = (req, res) => {
  try {
    const { user_id, url } = req.body;

    if (!user_id || !url) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const query =
      "INSERT INTO websites (user_id, url) VALUES (?, ?)";

    db.query(query, [user_id, url], (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        message: "Website added successfully",
      });
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};