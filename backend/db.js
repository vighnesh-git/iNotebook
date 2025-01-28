const mongoose = require('mongoose');
const express = require("express");

const mongoURI = "mongodb+srv://Vighnesh:Vighnesh12@inotebook.6tiqf.mongodb.net/inotebook?retryWrites=true&w=majority";

console.log("Connected to MongoDB successfully");
const connectToMongo =  () => {
    mongoose.connect(mongoURI);
};

module.exports = connectToMongo;

