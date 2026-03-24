export default {
  'frontend/**/*.{ts,tsx}': (filenames) => {
    const files = filenames.map(f => f.replace('frontend/', '')).join(' ')
    return [
      `cd frontend && eslint --fix ${files}`,
      'cd frontend && tsc --noEmit',
    ]
  },
}
