'use strict';

const port = process.env.PORT || 3000;

module.exports = {
    db: process.env.MONGODB_URL || 'mongodb://localhost:27017/',
    port: process.env.PORT || 3000,
}