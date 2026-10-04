const fs = require('fs');
let swagger = fs.readFileSync('docs/swagger.js', 'utf8');

const quizDocs = `
/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all financial literacy quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of quizzes
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit an answer for a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Result of the quiz
 */
`;

if (!swagger.includes('/api/quizzes')) {
    swagger += quizDocs;
    fs.writeFileSync('docs/swagger.js', swagger);
}
