const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bing = require('node-bing-api')({accKey:'ca68afaf5f654aecbbe85dce42a5a106'});
const searchTerm = require('./model/searchTerm');

//Connect mongoDB.
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms')

app.use(bodyParser.json());
app.use(cors());

// Get recent searches.
app.get("/api/recentsearches", (req, res) => {

    searchTerm.find({}, (err, data) => {
        if(err) 
        throw err;

        res.json(data)
    })

})

// search image.
app.get("/api/imagesearch/:searchVal", (req, res) => {

    var { searchVal } = req.params;
    var offset1 = Number(req.query.offset) || 1;

    var data = new searchTerm(
        {
            searchVal,
            searchDate: new Date()
        }
    )

    data.save((err) => {
        if(err){
        return res.send("Save error")
        }

    })

    var searchResults = [];
    // Use bing api to search for images.
    bing.images(searchVal, {
        count: 10,   // Number of results (max 50)
        offset: offset1 || 1  // Set the page result
        }, function(error, result, body){
         
            //res.json(body.value)
            body.value.forEach((search) => {
                searchResults.push({
                    url: search.webSearchUrl,
                    snippet: search.name,
                    thumbnail: search.thumbnailUrl,
                    context: search.hostPageUrl 
                })
            })

            res.json(searchResults)
            
        });
})

app.listen(process.env.PORT || 3000, () => {
    console.log("server is running...")
})