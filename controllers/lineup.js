'use strict';

const {wrap:async} = require('co');
const mongoose = require('mongoose');

const Lineup = mongoose.model('Lineup');
const Map = mongoose.model('Map');
const Hero = mongoose.model('Hero');
const fastJson = require('fast-json-stringify');

const stringifySchema = {
  type: 'object',
  properties: {
  lineup: {
    type: 'object',
    properties: {
      _id: { type: 'string'}, // ObjectId 的正则表达式模式
      time: { type: 'integer' },
      start: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' }
        },
        required: ['x', 'y']
      },
      end: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' }
        },
        required: ['x', 'y']
      },
      map: { type: 'string'}, // 假设这是对另一个文档的引用
      hero: { type: 'string'}, // 同上
      descs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            image: {
              type: 'string',
              format: 'buffer-base64'
            } // Buffer 将被转换成 base64 字符串
          },
          required: ['text', 'image'] // 如果在Mongoose中是必须的
        }
      },
      skill: { type: 'string' },
    }
  }}};

const stringify = fastJson(stringifySchema);

const mapLineupResp = (lineup) => {
  const { 
    descs, 
    ...rest
  } = lineup

  return {
    descs: descs.map(item => ({
      text: item.text, 
      image: item.image.toString('base64'),
    })),
    ...rest
  }
}
exports.get = async(function*(req, res) {
    const lineupId = req.params.id;
    try  {
        const lineup = yield Lineup.load(lineupId)
        const mappedLineUp = mapLineupResp(lineup)
        res.status(200).send(stringify({lineup: mappedLineUp}))
        // res.status(200).send({lineup: lineup})
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err.message})
    }
})

exports.list = async(function*(req, res) {
    try {
        const query = {}
        if (req.query.hero !== undefined) {
            const heroRecord = yield Hero.findOne({name: req.query.hero})
            query.hero = heroRecord._id;
        }
        if (req.query.map !== undefined) {
            const mapRecord = yield Map.findOne({name: req.query.map})
            query.map = mapRecord._id;
        }
        if (req.query.skill !== undefined) {
            query.skill = req.query.skill;
        }
        const lineups = yield Lineup.list(query);
        res.status(200).send({data: lineups});
    } catch(err) {
        console.log(err)
        res.status(400).json({error: err.message})
    }
})

exports.delete = async(function*(req, res) {
    const lineupId = req.params.id;
    
    try {
        const deletedLineup = yield Lineup.delete(lineupId)
        res.status(200).json({lineup: deletedLineup})

    } catch (err) {
        console.log(err)
        res.status(400).json({error: err.message})
    }
})

exports.create = async(function*(req, res) {
    try {
        const  {
            descs,
            start_point,
            end_point,
            map,
            hero,
            skill,
        } = req.body

        const images = req.files

        const mapRecord = yield Map.findOne({name: map})
        const heroRecord = yield Hero.findOne({name: hero})

        console.log("skill:", skill)
        if (!heroRecord.hasSkill(skill)) {
            throw (new Error(
                `英雄技能组中没有${skill}`
            ))
        }

        let descArray = []
        if (descs instanceof Array) {
            descArray = descs
        } else {
            descArray.push(descs)
        }

        const descsData = []
        for (let i = 0; i < images.length; i++) {
            console.log(images[i])
            console.log(images[i].buffer)
            descsData.push({
                text: descArray[i],
                image: images[i].buffer
            })
        }

        const newLineup = new Lineup({
            start: {
                x: start_point[0],
                y: start_point[1]
            },
            end: {
                x: end_point[0],
                y: end_point[1]
            },
            map: mapRecord._id,
            hero: heroRecord._id,
            descs: descsData,
            skill: skill,
        })
        yield newLineup.save();
        res.status(200).json({message: 'Linup uploaded successfully', lineup:mapLineupResp(newLineup)})

    } catch (err){ 
        console.log(err)
        res.status(400).json({error: err.message})
    }
})

