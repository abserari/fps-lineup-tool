'use strict';

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

exports.list = async function(req, res) {
    try {
        const { data: maps, error } = await supabase
            .from('maps')
            .select('*');

        if (error) throw error;

        res.status(200).send({data: maps});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.create = async function(req, res) {
    try {
        const { name } = req.body;
        const imageBuffer = req.file.buffer;

        const { data: map, error } = await supabase
            .from('maps')
            .insert([{
                name,
                image: imageBuffer
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({message: 'Map uploaded successfully', map});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};