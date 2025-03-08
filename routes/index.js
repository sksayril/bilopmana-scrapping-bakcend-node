var express = require('express');
var router = express.Router();
const Razorpay = require("razorpay");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const scrapeGoogleMaps = require("../utilities/module.scrapper");
const ScrapeResult = require("../models/scrape.model");

/* GET home page. */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
      const { amount } = req.body; // Amount in INR
      const order = await razorpay.orders.create({
          amount: amount * 100, // Convert to paisa
          currency: "INR",
          receipt: "receipt_" + Date.now(),
      });

      res.json(order);
  } catch (error) {
      res.status(500).json({ error: "Error creating Razorpay order" });
  }
});


router.post("/verify-payment", async (req, res) => {
  try {
      const { userToken, order_id, payment_id } = req.body;
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return res.status(400).json({ error: "User not found" });

      user.credits += 130; 
      await user.save();

      res.json({ message: "Payment successful", credits: user.credits });
  } catch (error) {
      res.status(500).json({ error: "Payment verification failed" });
  }
});

// scrapeapi
// router.post("/scrape", async (req, res) => {
//   try {
//       const { userToken, keyword } = req.body;
//       const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id);

//       if (!user || user.credits < 50) {
//           return res.status(400).json({ error: "Not enough credits. Minimum 50 credits required." });
//       }

//       const result = await scrapeGoogleMaps(keyword, user._id);

//       if (result.count === 0) {
//           return res.status(400).json({ error: "No new data available. You have already scraped all available results." });
//       }

//       // Deduct credits (50 per request)
//       user.credits -= 50;
//       await user.save();

//       // Save the new unique results
//       let existingScrape = await ScrapeResult.findOne({ userId: user._id, keyword });
//       if (existingScrape) {
//           existingScrape.data.push(...result.data);
//           await existingScrape.save();
//       } else {
//           const savedScrape = new ScrapeResult({ userId: user._id, keyword, data: result.data });
//           await savedScrape.save();
//       }

//       res.json({ message: "Scraping successful", data: result.data, remainingCredits: user.credits });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Scraping failed" });
//   }
// });

router.post("/scrape", async (req, res) => {
  try {
      const { userToken, keyword } = req.body;
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.credits < 50) {
          return res.status(400).json({ error: "Not enough credits. Minimum 50 credit required." });
      }

      const result = await scrapeGoogleMaps(keyword, user._id);

      if (result.count === 0) {
          return res.status(400).json({ error: "No new data available. You have already scraped all available results." });
      }

      // Calculate the actual number of results extracted
      const dataCount = result.count; // Extracted results count

      // Deduct credits dynamically (1 credit per result)
      if (user.credits < dataCount) {
          return res.status(400).json({ error: `Not enough credits. You need at least ${dataCount} credits.` });
      }

      user.credits -= dataCount; // Deduct only for the number of extracted results
      await user.save();

      // Save the new unique results
      let existingScrape = await ScrapeResult.findOne({ userId: user._id, keyword });
      if (existingScrape) {
          existingScrape.data.push(...result.data);
          await existingScrape.save();
      } else {
          const savedScrape = new ScrapeResult({ userId: user._id, keyword, data: result.data });
          await savedScrape.save();
      }

      res.json({
          message: "Scraping successful",
          data: result.data,
          extractedCount: dataCount,
          remainingCredits: user.credits
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Scraping failed" });
  }
});

module.exports = router;
