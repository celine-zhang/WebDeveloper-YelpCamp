const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "64a7e0793c3d135926f6cf1e",
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta excepturi dolore itaque eaque? Numquam, accusamus alias corporis harum nihil tenetur qui ab sunt! Hic itaque beatae accusamus tempora? Ex, cumque.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      image: [
        {
          url: "https://res.cloudinary.com/dpj3kgmu7/image/upload/v1688807906/YelpCamp/ldggjnslqsgd57ikabah.jpg",
          filename: "YelpCamp/ldggjnslqsgd57ikabah",
        },
        {
          url: "https://res.cloudinary.com/dpj3kgmu7/image/upload/v1688807907/YelpCamp/cchty5jfml8vmef8jq2x.jpg",
          filename: "YelpCamp/cchty5jfml8vmef8jq2x",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
