const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClinet = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
 };
 
 module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {
        path: "author",
    },
    })
    .populate("owner") ;
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing}); 
};

module.exports.rendeNewForm = async (req,res,next)=>{
    res.render("listings/new.ejs")
}
module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClinet.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();
    

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");   
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
  
     await Listing.findByIdAndUpdate(id, {...req.body.listing});
     req.flash("success", "Listing Updated");
     res.redirect(`/listings/${id}`);
  };

  module.exports.destoryListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};


// done bas whai ek problem tha kya 
// shirf ise listing me problem thaa
// nhi sabhi me problem tha ek baae bata do ge kaya tha
// pahel apka data.js me gemotery set nhi tha isse liye nhi aa rah tah or listing .js me apne jo reqire kiya tha vo sahi se user nhi kiya dekhiye 
// ye apka naem same nhi tha kal bhi bolta tha ki jaha ye likha h uska dekhiye nhi to code send kijiye ok or apka 
// model me listing.js me geometry ka object sahi se nhi tha 
// ok done or kuch h  data.js me kaha par prlm tha

// didi ne jab location change kiye to old listing me location add nhi tha to location nhi aa rha tha 
// ye maine group me bhi bataya tha solution 