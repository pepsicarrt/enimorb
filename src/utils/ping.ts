export const checkPing = (url: string) => {
  const startTime = new Date().getTime();

  fetch(url, {
    method: 'HEAD', // Using HEAD method to avoid downloading the entire resource
    mode: 'no-cors' // To bypass CORS issues
  })
  .then(async (response) => {
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;
    console.log(`Server responded in ${responseTime}ms`);
    return responseTime;
  })
  .catch(error => {
    console.log('Failed to reach the server.');
  });
}
