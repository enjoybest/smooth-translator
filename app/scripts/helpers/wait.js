// Simple wait implementation without external dependencies
export default function (escapeFunction, maxWait = 10000, checkDelay = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    // Try immediately first
    try {
      const result = escapeFunction()
      if (result) {
        return resolve(result)
      }
    } catch (error) {
      return reject(error)
    }

    // Poll with interval
    const interval = setInterval(() => {
      try {
        const result = escapeFunction()
        if (result) {
          clearInterval(interval)
          resolve(result)
        } else if (Date.now() - startTime > maxWait) {
          clearInterval(interval)
          reject(new Error('Wait timeout exceeded'))
        }
      } catch (error) {
        clearInterval(interval)
        reject(error)
      }
    }, checkDelay)
  })
}
