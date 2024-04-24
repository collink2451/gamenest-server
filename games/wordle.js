// Router for wordle game

const express = require('express')
const router = express.Router()


router.get('/wordle', (req, res) => {
    res.send("Wordle Test")
})


module.exports = router;