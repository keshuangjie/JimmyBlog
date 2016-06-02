var exec = require('child_process').exec;
hexo.on('new', function(target) {
	exec('open -a MacDown ' + target);
	});
