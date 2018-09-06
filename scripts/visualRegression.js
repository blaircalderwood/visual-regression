const fs = require('fs');

const rimrafSync = require('rimraf').sync;
const BlinkDiff = require('blink-diff');

const challengerPath = 'screenshots/challenger';
const championPath = 'screenshots/champion';
const diffPath = 'screenshots/diff';

function removePreviousRun(filePath) {
  rimrafSync(filePath);
  fs.mkdirSync(filePath);
}

function passesVisualRegression(imageFileName) {
  const diff = new BlinkDiff({
    imageAPath: `${championPath}/${imageFileName}`,
    imageBPath: `${challengerPath}/${imageFileName}`,
    imageOutputPath: `${diffPath}/${imageFileName}`,
    imageOutputLimit: BlinkDiff.OUTPUT_DIFFERENT,
    thresholdType: BlinkDiff.THRESHOLD_PERCENT,
    threshold: 0.01,
  });

  return new Promise(
    (resolve, reject) =>
      diff.run((error, result) => {
        if (error) {
          return reject(error);
        }

        if (diff.hasPassed(result.code)) {
          return resolve({ passed: true });
        }

        return resolve({ passed: false, imageFileName });
      })
  );
}

function runVisualRegression() {
  const championImages = fs.readdirSync(championPath);
  const visualRegressionPromises = [];
  const failedFiles = [];

  championImages.forEach(imageFileName => {
    visualRegressionPromises.push(passesVisualRegression(imageFileName));
  });

  Promise.all(visualRegressionPromises)
    .then(values => {
      values.forEach(value => {
        if (value.passed === false) {
          failedFiles.push(value.imageFileName);
        }
      });

      if (failedFiles.length > 0) {
        const failedFilesString = `\n${failedFiles.join('\n')}\n`;

        throw new Error(
          `The following files have failed visual regression: ${failedFilesString}
          If you wish to accept these changes please run:
          npm run test:vr-approve`
        );
      }
    })
    .catch(err => {
      console.error(err);
      process.exitCode = 1;
    });
}

removePreviousRun(diffPath);
runVisualRegression();
