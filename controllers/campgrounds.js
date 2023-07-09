const campground = require("../models/campground");
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index.ejs", { campgrounds });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("campgrounds/new.ejs");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = geoData.body.features[0].geometry;
  newCampground.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  await newCampground.save();
  console.log(newCampground);
  req.flash("success", "Succesfully made a new campground!");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  //use ref to join and populate to select properties from the ref dataset
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit.ejs", { campground });
};

module.exports.updateCampground = async (req, res) => {
  //Step1: validate the id Step2:Validate the user
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.image.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    //delete in the cloudinary
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    //delete in the mongo
    await campground.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(campground);
  }
  req.flash("success", "Succesfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Succesfully deleted campground!");
  res.redirect("/campgrounds");
};
