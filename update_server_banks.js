const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

if (!server.includes('/api/banks')) {
    server = server.replace("app.use('/api/quizzes', require('./routes/quizRoutes'));", "app.use('/api/quizzes', require('./routes/quizRoutes'));\napp.use('/api/banks', require('./routes/bankRoutes'));");
    fs.writeFileSync('server.js', server);
}
