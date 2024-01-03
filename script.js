document.addEventListener('DOMContentLoaded', function () {
  let audioContext, mediaRecorder, analyser, dataArray
  let showStopRecording = false
  let audioVolumeCanvas = 0
  let audioNextPos = 0

  const canvas = document.querySelector("#canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  const startButton = document.getElementById('startButton')
  const stopButton = document.getElementById('stopButton')
  const volumeDisplay = document.getElementById('volume')

  startButton.addEventListener('click', startRecording)
  stopButton.addEventListener('click', stopRecording)

  function startRecording() {
    showStopRecording = true

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      dataArray = new Uint8Array(analyser.frequencyBinCount)

      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)

      mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = handleDataAvailable
      mediaRecorder.onstop = handleRecordingStop

      mediaRecorder.start()

      animate()
    })
    .catch(error => {
      console.error('Error accessing microphone:', error)
    })
  }

  function handleDataAvailable(event) {
    if (event.data.size > 0) {
      // Check if theres any usable data
      console.log(event)
    }
  }

  function handleRecordingStop() {
    analyser.disconnect()
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }

  function visualizeAudio() {
    analyser.getByteFrequencyData(dataArray)
    const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length
    volumeDisplay.textContent = `Volume: ${average.toFixed(2)}`
    let barHeight = canvas.height

    audioNextPos = (Math.floor((average / 100) * 100) / 100) * canvas.height

    if (audioVolumeCanvas <= audioNextPos && showStopRecording) {
      audioVolumeCanvas += 30
    } else {
      audioVolumeCanvas -= 30
    }

    for (let i = 0; i < canvas.width; i += 100) {
      ctx.beginPath()
      ctx.rect(i, barHeight - audioVolumeCanvas, 80, audioVolumeCanvas)
      ctx.fill()
      ctx.closePath()
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (showStopRecording) {
      visualizeAudio()
      requestAnimationFrame(animate)
      startButton.classList.add("hide")
      stopButton.classList.remove("hide")
    } else {
      cancelAnimationFrame(animate)
      startButton.classList.remove("hide")
      stopButton.classList.add("hide")
    }
  }

  function stopRecording() {
    showStopRecording = false
    mediaRecorder.stop()
  }
})