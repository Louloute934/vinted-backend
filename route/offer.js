const express = require("express");
const formidable = require("express-formidable");
const isAuthenticated = require("../middlewares/isAuthenticated");
const router = express.Router();
router.use(formidable());

const User = require("../Model/User");
const Offer = require("../Model/Offer");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (
      req.fields.title.length <= 50 &&
      req.fields.description.length <= 500 &&
      req.fields.price <= 100000
    ) {
      const newOffer = new Offer({
        product_name: req.fields.title,
        product_description: req.fields.description,
        product_price: req.fields.price,
        product_details: [
          { MARQUE: req.fields.brand },
          { TAILLE: req.fields.size },
          { ETAT: req.fields.condition },
          { COULEUR: req.fields.color },
          { EMPLACEMENT: req.fields.city },
        ],
        owner: req.user,
        product_image: req.files.picture,
      });

      await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/vinted-final/offer/${newOffer._id}`,
      });
      await newOffer.save();

      res.json({
        _id: newOffer.id,
        product_name: newOffer.product_name,
        product_description: newOffer.product_description,
        product_price: newOffer.product_price,
        product_details: newOffer.product_details,
        owner: newOffer.owner.account,
        product_image: newOffer.product_image,
      });
    } else {
      res.json("Desciption limit: 500, title limit: 50, price limit: 100000");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = { $lte: req.query.priceMax };
      }
    }

    let sort = {};
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        sort = { product_price: 1 };
      } else if (req.query.sort === "price-desc") {
        sort = { product_price: -1 };
      }
    }

    let page;
    const limit = req.query.limit;

    if (req.query.page < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("product_name product_price");

    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
