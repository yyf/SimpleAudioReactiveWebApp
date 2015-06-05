document.addEventListener('DOMContentLoaded',domloaded,false);
function domloaded(){ 
            // audio setup
            window.addEventListener('load', initAudio );
            window.AudioContext = window.AudioContext || window.webkitAudioContext;            
            var audioContext = null, audioInput = null, realAudioInput = null, inputPoint = null, sampleGain = null, meter = null;            
            var audioContext = new AudioContext();            
            // graphics setup
            var canvas = document.getElementById('SimpleAudioReactiveWebApp');
            var context = canvas.getContext('2d'), centerX = canvas.width / 2, centerY = canvas.height / 2, radius = 70;        

            function gotStream(stream) {
                inputPoint = audioContext.createGain();                
                realAudioInput = audioContext.createMediaStreamSource(stream);
                audioInput = realAudioInput;
                
                // pass through
                sampleGain = audioContext.createGain();                                
                sampleGain.connect( audioContext.destination );    
                
                
                audioInput.connect(inputPoint);            
                inputPoint.connect( sampleGain );

                meter = createAudioMeter(audioContext);
                realAudioInput.connect(meter);    

                drawLoop();        
            }

            function initAudio() {
                    if (!navigator.getUserMedia)
                        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    if (!navigator.cancelAnimationFrame)
                        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
                    if (!navigator.requestAnimationFrame)
                        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

                    navigator.getUserMedia(
                        {
                            "audio": {
                                "mandatory": {
                                    "googEchoCancellation": "false",
                                    "googAutoGainControl": "false",
                                    "googNoiseSuppression": "false",
                                    "googHighpassFilter": "false"
                                },
                                "optional": []
                            },
                        }, gotStream, function(e) {
                            alert('Error getting audio');
                            console.log(e);
                        });
            }

            // the following functions are modified from http://webaudiodemos.appspot.com/
            function createAudioMeter(audioContext) {                
                var processor = audioContext.createScriptProcessor(512);
                processor.onaudioprocess = volumeAudioProcess;                
                processor.volume = 0;                
                processor.connect(audioContext.destination);
                processor.shutdown =
                    function(){
                        this.disconnect();
                        this.onaudioprocess = null;
                    };
                return processor;
            }

            function volumeAudioProcess( event ) {
                var buf = event.inputBuffer.getChannelData(0);
                var bufLength = buf.length;
                var x;                
                for (var i=0; i<bufLength; i++) {                
                    this.volume = buf[i];
                }
            }
            
            function drawLoop( time ) {                            
                context.clearRect(0,0,500,500);
                context.beginPath();
                context.arc(centerX, centerY, radius+radius*meter.volume, 0, 2 * Math.PI, false);
                context.lineWidth = 10;
                context.fillStyle = 'black';                
                context.stroke();
                window.requestAnimationFrame( drawLoop );
            }
}        