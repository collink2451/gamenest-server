// Router for dots and boxes game

const express = require('express')
const router = express.Router()


router.get('/dotsAndBoxes', (req, res) => {
    res.send("Dots and Boxes Test")
})


module.exports = router;