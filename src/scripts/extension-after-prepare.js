const path = require("path");
const fs = require("fs");
const {spawn } = require("child_process");

module.exports = function($logger, $platformsData, $projectData, hookArgs) {
    const platformName = hookArgs.platform.toLowerCase();
    const env = hookArgs['env'];

    if (platformName == "android") {
        return;
    }

    return new Promise(function (resolve, reject) {
        const platformData = $platformsData.getPlatformData(platformName);
        const xcodeProjPath = path.join(platformData.projectRoot, `${$projectData.projectName}.xcodeproj`);
        // console.log(`XCodeProj path exists ${fs.existsSync(xcodeProjPath)}`);
        let rubyProcess = spawn("/usr/bin/ruby" , [path.join(__dirname, 'add-notification-app-extension.rb'), xcodeProjPath, $projectData.projectIdentifiers.ios]);
        rubyProcess.stdout.on('data', data => {
			var stringData = data.toString();
			$logger.info(stringData);
		});

		rubyProcess.stderr.on('data', error => {
			var message = '';
			var stringData = error.toString();

			try {
				var parsed = JSON.parse(stringData);
				message = parsed.formatted || parsed.message || stringData;
			} catch (e) {
				message = error.toString();
			}

			$logger.info(message);
		});

		rubyProcess.on('error', error => {
			$logger.info(error.message);
			reject(error);
		});

		rubyProcess.on('exit', (code, signal) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`XCode Proj process failed with exit code ${code}`));
			}

			rubyProcess = null;
		});
    });
}
