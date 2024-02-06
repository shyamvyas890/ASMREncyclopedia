function showTiming() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTiming();
setInterval(function () {
	showTiming();
}, 1000);
