const formSubmitted = (seconds) => {
    let countDown = document.createElement('div');
    countDown.style.padding = '50px';
    countDown.innerHTML = `<h2>Thanks For Your Submission</h2>
    <h4>Redirecting to the homepage in <span id='secondCountDown'>${seconds}</span> seconds</h4>
    <img id='timer' src='https://chriscorchado.com/images/timer.gif' />`;
    document.getElementsByClassName('container')[0].append(countDown);
    let updateCountDown = setInterval(function () {
        seconds--;
        document.getElementById('secondCountDown').innerHTML = seconds.toString();
        if (seconds === 0) {
            clearInterval(updateCountDown);
            window.location.replace(location.href.substring(0, location.href.lastIndexOf('/') + 1));
        }
    }, 1000);
};
export { formSubmitted };
