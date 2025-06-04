'use strict';

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

exports.index = async function(_, res) {
    try {
        const { data: heroes, error } = await supabase
            .from('heroes')
            .select('*');

        if (error) throw error;

        res.status(200).send({data: heroes});
    } catch (err) {
        res.status(400).send({error: err.message});
    }
};

exports.create = async function(req, res) {
    try {
        const { name } = req.body;
        const { data: hero, error } = await supabase
            .from('heroes')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;

        res.status(200).send({data: hero});
    } catch (err) {
        res.status(400).send({error: err.message});
    }
};

exports.addSkill = async function(req, res) {
    try {
        const { hero: heroName, skill } = req.body;
        
        // Get the hero first
        const { data: heroes, error: heroError } = await supabase
            .from('heroes')
            .select('*')
            .eq('name', heroName)
            .single();

        if (heroError) throw heroError;
        if (!heroes) throw new Error(`Hero ${heroName} not found`);

        const skills = heroes.skills || [];
        if (skills.includes(skill)) {
            throw new Error(`Skill ${skill} already exists`);
        }

        // Update the hero with the new skill
        const { data: updatedHero, error } = await supabase
            .from('heroes')
            .update({ skills: [...skills, skill] })
            .eq('id', heroes.id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).send({data: updatedHero});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};