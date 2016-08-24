var webpack = require("webpack");

module.exports = {
    entry   : "./src/overlay.js",
    target  : "web",
    devtool : "source-map",
    output  : {
        path          : "dist/",
        filename      : "lightstep-overlay.min.js",
        library       : "LightStepOverlay",
        libraryTarget : "var",
    },
    externals : {
        "opentracing": "Tracer",
    },
    plugins :[
        new webpack.DefinePlugin({
            DEBUG : false,
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            // beautify: true,
            compress : {
                dead_code : true,
                unused : true,
                // Hide the dead code warnings. The defines intentionally create
                // dead code paths.
                warnings  : false,
            }
        }),
        new webpack.optimize.DedupePlugin(),
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
