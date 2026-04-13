function babelConfig(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
    };
}

module.exports = babelConfig;
