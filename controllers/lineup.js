'use strict';

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

exports.get = async function(req, res) {
    try {
        const lineupId = req.params.id;

        const { data: lineup, error: lineupError } = await supabase
            .from('lineups')
            .select(`
                *,
                hero:hero_id(name),
                map:map_id(name)
            `)
            .eq('id', lineupId)
            .single();

        if (lineupError) throw lineupError;

        const { data: descriptions, error: descError } = await supabase
            .from('lineup_descriptions')
            .select('*')
            .eq('lineup_id', lineupId);

        if (descError) throw descError;

        const mappedLineup = {
            ...lineup,
            descs: descriptions.map(desc => ({
                text: desc.text,
                image: Buffer.from(desc.image).toString('base64')
            }))
        };

        res.status(200).send({lineup: mappedLineup});
    } catch (err) {
        console.log(err);
        res.status(400).json({error: err.message});
    }
};

exports.list = async function(req, res) {
    try {
        let query = supabase
            .from('lineups')
            .select(`
                *,
                hero:hero_id(name),
                map:map_id(name)
            `);

        if (req.query.hero) {
            const { data: hero } = await supabase
                .from('heroes')
                .select('id')
                .eq('name', req.query.hero)
                .single();
            if (hero) {
                query = query.eq('hero_id', hero.id);
            }
        }

        if (req.query.map) {
            const { data: map } = await supabase
                .from('maps')
                .select('id')
                .eq('name', req.query.map)
                .single();
            if (map) {
                query = query.eq('map_id', map.id);
            }
        }

        if (req.query.skill) {
            query = query.eq('skill', req.query.skill);
        }

        const { data: lineups, error } = await query;

        if (error) throw error;

        res.status(200).send({data: lineups});
    } catch (err) {
        console.log(err);
        res.status(400).json({error: err.message});
    }
};

exports.delete = async function(req, res) {
    try {
        const lineupId = req.params.id;

        const { data: deletedLineup, error } = await supabase
            .from('lineups')
            .delete()
            .eq('id', lineupId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({lineup: deletedLineup});
    } catch (err) {
        console.log(err);
        res.status(400).json({error: err.message});
    }
};

exports.create = async function(req, res) {
    try {
        const {
            descs,
            start_point,
            end_point,
            map: mapName,
            hero: heroName,
            skill,
        } = req.body;

        const images = req.files;

        // Get hero and map IDs
        const { data: hero } = await supabase
            .from('heroes')
            .select('*')
            .eq('name', heroName)
            .single();

        const { data: map } = await supabase
            .from('maps')
            .select('*')
            .eq('name', mapName)
            .single();

        if (!hero || !map) {
            throw new Error('Hero or map not found');
        }

        if (!hero.skills.includes(skill)) {
            throw new Error(`Hero skill ${skill} not found`);
        }

        // Create lineup
        const { data: lineup, error: lineupError } = await supabase
            .from('lineups')
            .insert([{
                hero_id: hero.id,
                map_id: map.id,
                skill,
                start_x: start_point[0],
                start_y: start_point[1],
                end_x: end_point[0],
                end_y: end_point[1]
            }])
            .select()
            .single();

        if (lineupError) throw lineupError;

        // Create descriptions
        let descArray = Array.isArray(descs) ? descs : [descs];
        const descData = descArray.map((text, i) => ({
            lineup_id: lineup.id,
            text,
            image: images[i].buffer
        }));

        const { data: descriptions, error: descError } = await supabase
            .from('lineup_descriptions')
            .insert(descData)
            .select();

        if (descError) throw descError;

        const mappedLineup = {
            ...lineup,
            descs: descriptions.map(desc => ({
                text: desc.text,
                image: Buffer.from(desc.image).toString('base64')
            }))
        };

        res.status(200).json({
            message: 'Lineup uploaded successfully',
            lineup: mappedLineup
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({error: err.message});
    }
};