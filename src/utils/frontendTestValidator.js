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

  /**
   * Decode HTML entities
   */
  decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  /**
   * Extract test cases from Jest test file
   */
  extractTests(testFile) {
    try {
      testFile = this.decodeHtmlEntities(testFile);
      const tests = [];
      
      // Match test() or it() blocks
      const testRegex = /(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*\);/g;
      let match;

      while ((match = testRegex.exec(testFile)) !== null) {
        const testName = match[1];
        const testBody = match[2];
        tests.push({
          name: testName,
          body: testBody,
          status: 'pending'
        });
      }

      return tests;
    } catch (error) {
      console.error('Error extracting tests:', error);
      return [];
    }
  }

  /**
   * Create a mock expect object for assertions
   */
  createExpectMock() {
    const assertions = [];

    const expect = (value) => {
      const matchers = {
        toBeTruthy: () => {
          assertions.push({
            type: 'toBeTruthy',
            value,
            passed: !!value
          });
          return matchers;
        },
        toBeFalsy: () => {
          assertions.push({
            type: 'toBeFalsy',
            value,
            passed: !value
          });
          return matchers;
        },
        toBe: (expected) => {
          assertions.push({
            type: 'toBe',
            value,
            expected,
            passed: value === expected
          });
          return matchers;
        },
        toEqual: (expected) => {
          assertions.push({
            type: 'toEqual',
            value,
            expected,
            passed: JSON.stringify(value) === JSON.stringify(expected)
          });
          return matchers;
        },
        toContain: (expected) => {
          const passed = Array.isArray(value) 
            ? value.includes(expected)
            : String(value).includes(String(expected));
          assertions.push({
            type: 'toContain',
            value,
            expected,
            passed
          });
          return matchers;
        },
        toBeGreaterThan: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue > numExpected;
          assertions.push({
            type: 'toBeGreaterThan',
            value: numValue,
            expected: numExpected,
            passed
          });
          return matchers;
        },
        toBeGreaterThanOrEqual: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue >= numExpected;
          assertions.push({
            type: 'toBeGreaterThanOrEqual',
            value: numValue,
            expected: numExpected,
            passed
          });
          return matchers;
        },
        toBeLessThan: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue < numExpected;
          assertions.push({
            type: 'toBeLessThan',
            value: numValue,
            expected: numExpected,
            passed
          });
          return matchers;
        },
        toBeLessThanOrEqual: (expected) => {
          const numValue = Number(value);
          const numExpected = Number(expected);
          const passed = !isNaN(numValue) && !isNaN(numExpected) && numValue <= numExpected;
          assertions.push({
            type: 'toBeLessThanOrEqual',
            value: numValue,
            expected: numExpected,
            passed
          });
          return matchers;
        }
      };

      return matchers;
    };

    return { expect, assertions };
  }

  /**
   * Run a single test
   */
  runTest(test, html, css, js, dataJs) {
    try {
      // Create iframe for isolated DOM
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Set up the iframe with HTML, CSS, and JS
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${dataJs}</script>
          <script>${js}</script>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for iframe to load and scripts to execute
      return new Promise((resolve) => {
        // Give more time for scripts to execute
        setTimeout(() => {
          try {
            const { expect, assertions } = this.createExpectMock();
            
            // Execute test body with iframe's document context
            const testFunction = new Function('expect', 'document', test.body);
            testFunction(expect, iframeDoc);

            // Check if all assertions passed
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
            document.body.removeChild(iframe);
            resolve({
              name: test.name,
              status: 'failed',
              error: error.message,
              passed: false
            });
          }
        }, 300);
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

  /**
   * Run all tests
   */
  async runAllTests(testFile, html, css, js, dataJs) {
    try {
      const tests = this.extractTests(testFile);
      
      if (tests.length === 0) {
        return {
          passed: 0,
          failed: 0,
          total: 0,
          tests: [],
          percentage: 0,
          error: 'No tests found'
        };
      }

      const results = [];
      
      for (const test of tests) {
        const result = await this.runTest(test, html, css, js, dataJs);
        results.push(result);
      }

      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      const total = results.length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

      this.testResults = {
        passed,
        failed,
        total,
        tests: results,
        percentage,
        error: null
      };

      return this.testResults;
    } catch (error) {
      console.error('Error running tests:', error);
      return {
        passed: 0,
        failed: 0,
        total: 0,
        tests: [],
        percentage: 0,
        error: error.message
      };
    }
  }

  /**
   * Get test results
   */
  getResults() {
    return this.testResults;
  }

  /**
   * Get percentage
   */
  getPercentage() {
    return this.testResults.percentage;
  }
}

export default new FrontendTestValidator();
