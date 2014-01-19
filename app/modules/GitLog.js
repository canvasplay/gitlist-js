/**
 * GitLog
 */
var GitLog = function() {
    var commits = {};
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var commitStringToObject = function(data) {
	var history = data.toString('utf-8').split('\n');
	history.forEach(function(logLine, index) {
	    if ('commit ' == logLine.substr(0, 'commit '.length)) {
		var date = history[index + 2].substr(8);
		var shortDate = new Date(Date.parse(date));
		var dateTitle = months[shortDate.getMonth()] + ' ' + shortDate.getDate() + ', ' + shortDate.getFullYear();
		if ('undefined' == typeof commits[dateTitle]) {
	            commits[dateTitle] = {};
		}
                commits[dateTitle][logLine.substr(7)] = {
		    author: {
			name: history[index + 1].substring(8, history[index + 1].indexOf('<') - 1),
		        email: history[index + 1].substring(history[index + 1].indexOf('<') + 1, history[index + 1].indexOf('>'))
		    },
		    date: history[index + 2].substr(8),
		    msg: history[index + 4].substr(4)
		};
	    }
	});
    };

    this.getLog = function(path, branch, page, callback) {
	var spawn = require('child_process').spawn;
	var commitsToSkip = 0;
	if (0 < page) {
	    commitsToSkip = 15 * page;
	}
	var gitLog = spawn('git', ['log', '--first-parent', branch, '-n', 15, '--skip=' + commitsToSkip], {cwd: path});
	gitLog.stdout.on('data', commitStringToObject);
	gitLog.on('close', function(code) {
	    var gitLogCount = spawn('git', ['rev-list', branch, '--count'], {cwd: path});
	    gitLogCount.stdout.on('data', function(data) {
		callback(
		    {
			breadcrumb: {'Commit history': ''},
			commits: commits,
			commitCount: data
		    }
		);
	    });
	});
    };
};

module.exports = GitLog;
