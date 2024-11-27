'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MapSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    image: Buffer
});

MapSchema.path('name').required(true, "map name can't be blank");

MapSchema.statics = {
    load: function(_id) {
        return this.findOne({_id}).exec();
    },
    list: function(query) {
        return this.find(query).exec();
    }
}

mongoose.model('Map', MapSchema);
