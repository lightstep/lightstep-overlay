var webpack = require("webpack");

var defines = {
    DEBUG : true,
};

module.exports = {
    entry   : "./src/overlay.js",
    target  : "web",
    devtool : "source-map",
    output  : {
        path          : "dist/",
        filename      : "lightstep-overlay.js",
        library       : "LightStepOverlay",
        libraryTarget : "var",
    },
    plugins :[
        new webpack.DefinePlugin(defines),
    ],
    module  : {
        loaders : [
            {
                test    : /\.js$/,
                loader  : "babel",
                include : /src\//,
                excluse : /node_modules/,
                query   : {
                    cacheDirectory : true,
                    presets : [ "es2015" ],
                    plugins : [ "add-module-exports" ],
                }
            },
            {
                test    : /\.json$/,
                loader  : "json",
            },
        ]
    },
};
