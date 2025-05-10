// custom-reporter.js
class SimpleListReporter {
  onRunComplete(contexts, results) {
    const failedTestFiles = results.testResults.filter((test) => test.numFailingTests > 0);

    if (failedTestFiles.length === 0) {
      console.log('All tests passed!');
      return;
    }

    console.log('Failed files:');
    // biome-ignore lint/complexity/noForEach: <explanation>
    failedTestFiles.forEach((testResult) => {
      console.log(`- ${testResult.testFilePath}`);
    });

    // console.log('\nDrill down into individual failures by checking the test details below:\n');
    // biome-ignore lint/complexity/noForEach: <explanation>
    failedTestFiles.forEach((testResult) => {
      console.log(`Failed: ${testResult.testFilePath}`);
      // biome-ignore lint/complexity/noForEach: <explanation>
      testResult.testResults.forEach((test) => {
        if (test.status === 'failed') {
          console.log(`  ${test.fullName}`);
        }
      });
    });
  }
}

export default SimpleListReporter;
