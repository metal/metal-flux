'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'metalFlux.css',
	bundleFileName: 'metalFlux.js',
	globalName: 'metal',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-metalFlux'
});
