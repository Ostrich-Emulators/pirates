'use strict';

exports.list = function (req, res) {
    res.json({
        ships: [
            {
                name: 'one',
                x: 120,
                y: 500
            }
        ]
    });
};