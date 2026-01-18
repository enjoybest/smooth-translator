// Import all task files to register them with Gulp
// Import individual tasks first
import './tasks/chromereload.js';
import './tasks/clean.js';
import './tasks/fonts.js';
import './tasks/images.js';
import './tasks/locales.js';
import './tasks/manifest.js';
import './tasks/pages.js';
import './tasks/scripts.js';
import './tasks/styles.js';
// Import composite tasks that reference other tasks
import './tasks/build.js';
import './tasks/pack.js';
import './tasks/default.js';
// version.js removed - uses gulp-git which was removed from dependencies
