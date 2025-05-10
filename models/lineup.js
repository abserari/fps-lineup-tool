'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DescSchema = new Schema({
    text: String,
    image: Buffer
})

const PointSchema = new Schema({
    x: Number,
    y: Number

}) 

const LineupSchema = new Schema ({
    time: Number,
    start: {
        type:  PointSchema,
        required: true
    },
    end: {
        type:  PointSchema,
        required: true
    },
    map: {
        type: Schema.ObjectId,
        ref: 'Map'
    },
    hero: {
        type :Schema.ObjectId,
        ref: 'Hero'

    },
    descs: {
        type: [DescSchema],
        required: true
    },
    skill: {
        type: String,
        required: true
    },
})

LineupSchema.statics = {
    load: function(_id) {
        return this.findOne({_id}).exec();
    },
    list: function(options) {
        return this.find(options).select('start end map hero skill').exec();
    },
    delete: function(_id) {
        return this.findByIdAndDelete(_id);
    }
}

mongoose.model('Lineup', LineupSchema)
