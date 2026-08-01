"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _path = _interopRequireDefault(require("path"));
var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));
var _swagger = require("./config/swagger");
var _api = _interopRequireDefault(require("./routes/api"));
var _database = require("./db/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_dotenv.default.config();
const app = (0, _express.default)();
const PORT = process.env.PORT || 3000;
app.use((0, _cors.default)());
app.use(_express.default.json({
  limit: '10mb'
}));

// Swagger Documentation Route
app.use('/api/documentation', _swaggerUiExpress.default.serve, _swaggerUiExpress.default.setup(_swagger.swaggerSpec));

// API Routes
app.use('/api', _api.default);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
const frontendDistPath = _path.default.join(process.cwd(), 'dist');
app.use(_express.default.static(frontendDistPath));

// Catch-all to serve index.html for frontend routing (if it's not an /api route)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(_path.default.join(frontendDistPath, 'index.html'));
});
async function startServer() {
  try {
    await (0, _database.initDatabase)();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api/documentation`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}
startServer();