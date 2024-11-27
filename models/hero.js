'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HeroSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    skills: {
        type: [String]
    } 
});

HeroSchema.path('name').required(true, "hero name can't be blank");

HeroSchema.methods = {
    addSkill: function(skill) {
        if (this.skills.includes(skill)) {
            throw(new Error("已包含技能:"+ skill))
        }
        this.skills.push(skill);
        return this.save();
    },
    hasSkill: function(skill) {
        if (this.skills.includes(skill)) {
            return true;
        }
        return false
    }
}

HeroSchema.statics = {
    load: function(_id) {
        return this.findOne({_id}).exec();
    },
    list: function(query) {
        return this.find(query).exec();
    }
}

mongoose.model('Hero', HeroSchema);
