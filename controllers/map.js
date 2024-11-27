'use strict';

const {wrap:async} = require('co');
const mongoose = require('mongoose');

const Map = mongoose.model('Map');
const only = require('only');

exports.list = async(function*(req, res) {
    console.log(req.query);
    const lineups = yield Map.list(req.query);
    res.status(200).send({data: lineups});
})

exports.create = async(function*(req, res) {
    try {
        const { name } = req.body;
        const imageBuffer = req.file.buffer;
        console.log(name)

        const newMap = new Map({
            name: name,
            image: imageBuffer
        })

        yield newMap.save();
        res.status(201).json({message: 'Map uploaded successfully', map: newMap});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})