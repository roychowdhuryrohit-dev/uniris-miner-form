module.exports = {
    apps: [{
        name: "miner-form",
        script: "app.js",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
        node_args: "-r dotenv/config",
        watch: true,
        ignore_watch: ["node_modules", ".env", ".gitignore", "package.json", "data"],
        watch_options: {
            followSymlinks: false,
        },
        kill_timeout: 10000,
        treekill: false
    }]
};