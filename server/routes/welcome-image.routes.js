const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { upload, uploadDir } = require('../middleware/upload.middleware');

router.get('/latest', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    if (files.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }
    const latest = files
      .filter(f => !f.startsWith('current_display'))
      .map(f => ({ name: f, time: fs.statSync(path.join(uploadDir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time)[0];
    res.json({ filename: latest.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (req.body.password !== 'princesspeach') {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ error: 'Incorrect password' });
    }

    handleWelcomeImageUpload(req, res);
  });
});

function handleWelcomeImageUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = path.extname(req.file.filename);
  const currentDisplayPath = path.join(uploadDir, `current_display${ext}`);

  try {
    fs.copyFileSync(req.file.path, currentDisplayPath);
    const scriptPath = path.join(__dirname, '..', '..', 'display-image.sh');
    const displayProcess = spawn('sudo', ['bash', scriptPath, currentDisplayPath], {
      detached: true,
      stdio: 'ignore'
    });
    displayProcess.unref();
  } catch (err) {
    console.error('Display update error:', err.message);
  }

  res.status(200).json({ message: 'Image uploaded successfully', filename: req.file.filename });
}

module.exports = router;
