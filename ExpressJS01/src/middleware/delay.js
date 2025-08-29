const delay = (ms = 1000) => {
    return (req, res, next) => {
        setTimeout(() => {
            next();
        }, ms);
    };
};

module.exports = delay;
