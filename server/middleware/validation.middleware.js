const { body, validationResult } = require('express-validator');

const validateFeedback = [
  body('comment')
    .notEmpty().withMessage('You didn\'t even put anything down...')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
    .not().contains('<').withMessage('This comment contained a "<" and it had better be for a <3 because bitch if you wanted to inject code or something I will publicly shame you for it')
    .not().contains('>').withMessage('Comment cannot contain ">" bitch are you trying to hack me or something? Bitch??'),
  body('name')
    .notEmpty().withMessage('Would love it if you could put down a name')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters')
    .not().contains('<').withMessage('This name contained a "<" and it had better be for a <3 because bitch if you wanted to inject code or something I will publicly shame you for it')
    .not().contains('>').withMessage('Name cannot contain ">" bitch are you trying to hack me or something? Bitch??'),
  body('color')
    .optional()
    .matches(/^#([0-9a-fA-F]{6})$/).withMessage('The colour needs to be a valid hex code'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateHomepageColor = [
  body('color')
    .notEmpty().withMessage('You have to put a colour (a hex code) into the box')
    .matches(/^#([0-9a-fA-F]{6})$/).withMessage('The colour needs to be a valid hex code'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateFeedback,
  validateHomepageColor
};
