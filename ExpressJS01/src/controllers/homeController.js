const getHomepage = (req, res) => {
    res.render('index', {
        title: 'FullStack NodeJS App',
        message: 'Welcome to FullStack NodeJS Application!',
        user: req.user || null
    });
};

module.exports = {
    getHomepage
};

