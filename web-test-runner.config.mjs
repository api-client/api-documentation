/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */

export default /** @type TestRunnerConfig */ ({
  // concurrency: 1,
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  testsFinishTimeout: 240000,
  testRunnerHtml: (testFramework) =>
	  `<html>
		  <body>
			<script src="node_modules/cryptojslib/components/core.js"></script>
			<script src="node_modules/cryptojslib/rollups/sha1.js"></script>
			<script src="node_modules/cryptojslib/components/enc-base64-min.js"></script>
			<script src="node_modules/cryptojslib/rollups/md5.js"></script>
			<script src="node_modules/cryptojslib/rollups/hmac-sha1.js"></script>
			<script type="module" src="${testFramework}"></script>
		  </body>
		</html>`
})
