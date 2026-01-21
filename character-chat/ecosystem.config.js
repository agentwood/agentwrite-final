const path = require('path');

module.exports = {
    apps: [{
        name: "cognee-service",
        script: "main.py",
        cwd: path.resolve(__dirname, "cognee-service"),
        interpreter: path.resolve(__dirname, "cognee-service/venv/bin/python"),
        env: {
            PORT: 8001,
            PYTHONUNBUFFERED: "1"
        }
    }]
}
