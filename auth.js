const express = require('express');
const router = express.Router();

router.get('/auth/github/callback', async (req, res) => {
    const code = req.query.code;

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user details
    const userResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    // Get username from response
    const { login } = await userResponse.json();

    if (accessToken) {
        // Create session cookie
        res.cookie('accessToken', accessToken, {
            sameSite: 'None',
            secure: true
        })

        // Return access token and user details
        res.json({ success: true, accessToken, user: login });
    } else {
        res.status(204).send()
    }
});

router.get('/auth/check', (req, res) => {
    if (!req.cookies) {
        res.status(204).send()
        return;
    }
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(204).send()
        return;
    }
    // Verify access token against github
    fetch('https://api.github.com/user', {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    }).then((response) => response.json())
        .then((data) => {
            res.json({ success: true, accessToken, user: data.login });
        })
        .catch(() => {
            res.status(204).send()
        });
});

router.get('/auth/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.status(204).send()
});

module.exports = router;