/**
 * Frontend Test Validator
 * Runs Jest tests in the browser and validates code
 */

class FrontendTestValidator {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: [],
      percentage: 0,
      error: null
    };
  }

  decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  extractTests(testFile) {
    try {
      testFile = this.decodeHtmlEntities(testFile);
      const tests = [];
      const headerRegex = /(?:test|it)\s*\(\s*['\"`]([^'\"`]+)['\"`]\s*,\s*(?:async\s*)?\(\s*\)\s*=>\s*\{/g;
      let match;

      while ((match = headerRegex.exec(testFile)) !== null) {
        const testName = match[1];
        const bodyStart = match.index + match[0].length;
        let depth = 1;
        let i = bodyStart;
        while (i < testFile.length && depth > 0) {
          if (testFile[i] === '{') depth++;
          else if (testFile[i] === '}') depth--;
          i++;
        }
        const testBody = testFile.slice(bodyStart, i - 1);
        tests.push({ name: testName, body: testBody, status: 'pending' });
      }

      return tests;
    } catch (error) {
      console.error('Error extracting tests:', error);
      return [];
    }
  }

  extractBeforeEach(testFile) {
    try {
      testFile = this.decodeHtmlEntities(testFile);
      const headerRegex = /beforeEach\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*\{/g;
      const match = headerRegex.exec(testFile);
      if (!match) return null;

      const bodyStart = match.index + match[0].length;
      let depth = 1;
      let i = bodyStart;
      while (i < testFile.length && depth > 0) {
        if (testFile[i] === '{') depth++;
        else if (testFile[i] === '}') depth--;
        i++;
      }
      return testFile.slice(bodyStart, i - 1);
    } catch (e) {
      return null;
    }
  }

  createExpectMock() {
    const assertions = [];

    const expect = (value) => {
      const matchers = {
        toBeTruthy: () => {
          assertions.push({ type: 'toBeTruthy', value, passed: !!value });
          return matchers;
        },
        toBeFalsy: () => {
          assertions.push({ type: 'toBeFalsy', value, passed: !value });
          return matchers;
        },
        toBe: (expected) => {
          assertions.push({ type: 'toBe', value, expected, passed: value === expected });
          return matchers;
        },
        toEqual: (expected) => {
          assertions.push({ type: 'toEqual', value, expected, passed: JSON.stringify(value) === JSON.stringify(expected) });
          return matchers;
        },
        toContain: (expected) => {
          const passed = Array.isArray(value)
            ? value.includes(expected)
            : String(value).includes(String(expected));
          assertions.push({ type: 'toContain', value, expected, passed });
          return matchers;
        },
        toBeGreaterThan: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue > numExpected;
          assertions.push({ type: 'toBeGreaterThan', value: numValue, expected: numExpected, passed });
          return matchers;
        },
        toBeGreaterThanOrEqual: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue >= numExpected;
          assertions.push({ type: 'toBeGreaterThanOrEqual', value: numValue, expected: numExpected, passed });
          return matchers;
        },
        toBeLessThan: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue < numExpected;
          assertions.push({ type: 'toBeLessThan', value: numValue, expected: numExpected, passed });
          return matchers;
        },
        toBeLessThanOrEqual: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue <= numExpected;
          assertions.push({ type: 'toBeLessThanOrEqual', value: numValue, expected: numExpected, passed });
          return matchers;
        }
      };

      return matchers;
    };

    return { expect, assertions };
  }

  runTest(test, html, css, js, dataJs, beforeEachBody) {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      const safeCSS = css.replace(/<\/style>/gi, '<\/style>');
      const safeHTML = html.replace(/<\/script>/gi, '<\/script>');
      const safeDataJs = dataJs.replace(/<\/script>/gi, '<\/script>');
      const safeJs = js.replace(/<\/script>/gi, '<\/script>');
      const safeTestBody = test.body.replace(/<\/script>/gi, '<\/script>');

      // If beforeEach exists: set window.__JS__ and run beforeEach (which sets up DOM via eval)
      // If no beforeEach: render HTML + run JS normally
      const mainScript = beforeEachBody
        ? 'window.__JS__=' + JSON.stringify(safeJs) + ';\n' +
          safeDataJs + '\n' +
          beforeEachBody.replace(/<\/script>/gi, '<\/script>') + '\n' +
          'window.__testBody=' + JSON.stringify(safeTestBody) + ';'
        : safeDataJs + '\n' +
          safeJs + '\n' +
          'window.__testBody=' + JSON.stringify(safeTestBody) + ';';

      const bodyHTML = beforeEachBody ? '' : safeHTML;

      const docContent =
        '<!DOCTYPE html><html><head>' +
        '<style>' + safeCSS + '</style>' +
        '<script>window.__scriptErrors=[];window.onerror=function(m){window.__scriptErrors.push(m);};<\/script>' +
        '</head><body>' +
        bodyHTML +
        '<script>' + mainScript + '<\/script>' +
        '</body></html>';

      iframeDoc.open();
      iframeDoc.write(docContent);
      iframeDoc.close();

      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const iframeWindow = iframe.contentWindow || iframe.contentDocument.defaultView;

            if (iframeWindow.__scriptErrors && iframeWindow.__scriptErrors.length > 0) {
              throw new Error(iframeWindow.__scriptErrors[0]);
            }

            const { expect, assertions } = this.createExpectMock();

            const runInScope = iframeWindow.Function('expect', 'document', iframeWindow.__testBody || safeTestBody);
            runInScope(expect, iframeDoc);

            const allPassed = assertions.length > 0 && assertions.every(a => a.passed);

            document.body.removeChild(iframe);

            resolve({
              name: test.name,
              status: allPassed ? 'passed' : 'failed',
              assertions,
              passed: allPassed,
              error: assertions.length === 0 ? 'No assertions found' : null
            });
          } catch (error) {
            let errMsg = error.message;
            if (errMsg.includes('Cannot read properties of null')) {
              errMsg = 'Element not found in DOM - check your HTML structure or selector';
            }
            document.body.removeChild(iframe);
            resolve({
              name: test.name,
              status: 'failed',
              error: errMsg,
              passed: false
            });
          }
        }, 500);
      });
    } catch (error) {
      return Promise.resolve({
        name: test.name,
        status: 'failed',
        error: error.message,
        passed: false
      });
    }
  }

  async runAllTests(testFile, html, css, js, dataJs) {
    try {
      const tests = this.extractTests(testFile);

      if (tests.length === 0) {
        return { passed: 0, failed: 0, total: 0, tests: [], percentage: 0, error: 'No tests found' };
      }

      const beforeEachBody = this.extractBeforeEach(testFile);
      const results = [];

      for (const test of tests) {
        const result = await this.runTest(test, html, css, js, dataJs, beforeEachBody);
        results.push(result);
      }

      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      const total = results.length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

      this.testResults = { passed, failed, total, tests: results, percentage, error: null };
      return this.testResults;
    } catch (error) {
      console.error('Error running tests:', error);
      return { passed: 0, failed: 0, total: 0, tests: [], percentage: 0, error: error.message };
    }
  }

  getResults() {
    return this.testResults;
  }

  getPercentage() {
    return this.testResults.percentage;
  }
}

export default new FrontendTestValidator();
