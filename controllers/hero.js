'use strict';

const {wrap:async} = require('co');

const mongoose = require('mongoose');

const Hero = mongoose.model('Hero');
const only = require('only');


exports.index = async(function*(_, res) {
    const heros = yield Hero.list();
    res.status(200).send({data: heros});
});

exports.create = async(function*(req,res) {
    console.log(req.body);
    const hero = new Hero(only(req.body, "name"));
    try {
        yield hero.save();
        res.status(200).send({data: hero});
    } catch(err) {
        res.status(400).send({error: err});
    }
})

exports.addSkill = async(function*(req, res) {
    try {
        const {hero, skill} = req.body;
        const heroList = yield Hero.list({name: hero});

        if (heroList.length === 0) {
            throw(new Error(`英雄 ${hero} 不存在`))
        }

        yield heroList[0].addSkill(skill);
        res.status(200).send({data: heroList[0]});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
})
