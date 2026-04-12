const PISTON_API = import.meta.env.VITE_BACKEND_URL || 'https://backend.orcode.in';

const languageMap = {
  71: { language: 'python', version: '3.10.0' },
  54: { language: 'c++', version: '10.2.0' },
  62: { language: 'java', version: '15.0.2' },
  50: { language: 'c', version: '10.2.0' },
  93: { language: 'javascript', version: '18.15.0' },
  74: { language: 'typescript', version: '5.0.3' },
  60: { language: 'go', version: '1.16.2' },
  73: { language: 'rust', version: '1.68.2' },
  78: { language: 'kotlin', version: '1.8.20' },
  72: { language: 'ruby', version: '3.0.1' },
  68: { language: 'php', version: '8.2.3' },
  46: { language: 'bash', version: '5.2.0' },
};

export const submitCode = async (code, languageId, stdin, retries = 2) => {
  const lang = languageMap[languageId] || { language: 'python', version: '3.10.0' };

  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(`${PISTON_API}/api/piston/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang.language,
          version: lang.version,
          files: [{ content: code }],
          stdin: stdin || ''
        })
      });

      if (!response.ok) {
        // If it's a 500 error, it might be a temporary timeout or server issue, so we retry
        if (response.status >= 500 && i < retries) {
          console.warn(`Piston execution failed with ${response.status}, retrying (${i + 1}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          continue;
        }
        throw new Error(`Piston API error: ${response.status}`);
      }

      const result = await response.json();
      
      // If result has an error from Piston proxy but not axios (e.g. detailed error JSON)
      if (result.error && i < retries) {
        console.warn(`Piston reported error: ${result.error}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      return {
        token: Date.now().toString(),
        stdout: result.run?.stdout || null,
        stderr: result.run?.stderr || null,
        status: {
          id: result.run?.code === 0 ? 3 : 12,
          description: result.run?.code === 0 ? 'Accepted' : 'Runtime Error'
        },
        time: result.run?.cpu_time || null,
        memory: result.run?.memory || null
      };
    } catch (error) {
      lastError = error;
      if (i < retries) {
        console.warn(`Piston fetch failed: ${error.message}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to execute code after multiple attempts');
};
