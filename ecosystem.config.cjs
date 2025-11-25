module.exports = {
    apps: [{
        name: "getserve.rs",
        script: "./server/index.js",
        env: {
            NODE_ENV: "production"
        }
    }]
}
