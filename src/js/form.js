const formSubmitted = (seconds) => {
  const countDown = document.createElement('div')
  countDown.style.padding = '50px'
  countDown.innerHTML = `<h2>Thanks For Your Submission</h2>
  <h4>Redirecting to the homepage in <span id="secondCountDown">${seconds}</span> seconds</h4>
  <img id="timer" src="https://chriscorchado.com/images/timer.gif" />`
  document.getElementsByClassName('container')[0].append(countDown)

  const urlParams = new URLSearchParams(window.location.search)

  if (!urlParams.get('submitted')) {
    const updateCountDown = setInterval(function () {
      seconds--
      document.getElementById('secondCountDown').innerHTML = seconds.toString();
      if (seconds === 0) {
        clearInterval(updateCountDown);
        window.location.replace(location.href.substring(0, location.href.lastIndexOf('/') + 1))
      }
    }, 1000)
  }
}
export { formSubmitted }
