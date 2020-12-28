var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var seeds = [
    {
        name: "Starter name",
        image: "images/download.png",
        description: "Starter"
    },
    {
        name: "Starter Rest",
        image: "images/download.png",
        description: "Starter"
    },
    {
        name: "Starter Desa",
        image: "images/download.png",
        description: "Starter"
    }
];
async function seedDB() {
    try {
        await Campground.remove({});
        console.log('Campgrounds Removed');
        await Comment.remove({});
        console.log('Comments Removed');
        for (const seed of seeds) {
            let campground = await Campground.create(seed);
            console.log('Campgrounds Created');
            let comment = await Comment.create(
                {
                    text: 'This place is great but no internet',
                    author: 'Homer'
                }
            )
            console.log('Comments Created');
            campground.comments.push(comment);
            campground.save();
            console.log('Comments added to Campgrounds');
        }   
    } catch (err) {
        console.log(err);
    }
}

module.exports = seedDB;