"""Original three-voice digital waltzes; not transcriptions of author MP3s."""
from pathlib import Path
import wave
import math
import numpy as np

OUT = Path(__file__).resolve().parents[2] / 'public/assets/audio/music'
OUT.mkdir(parents=True, exist_ok=True)
RATE = 22050
BEAT = .55
MELODY = [69,72,76,74,72,71, 69,64,67,71,69,67, 65,69,72,71,69,67, 64,68,71,76,74,68]
for name in ['menu', 'good', 'bad']:
    length=24*BEAT*2
    data=np.zeros(round(length*RATE))
    def note(midi,start,duration,volume,shape):
        count=round(duration*RATE);t=np.arange(count)/RATE
        frequency=440*2**((midi-69)/12)
        phase=(t*frequency)%1
        signal=(np.where(phase<.25,1.,-1.)*.5 if shape=='pulse' else 1-4*np.abs(phase-.5))
        envelope=np.minimum(1,t/.012)*np.minimum(1,np.maximum(0,duration-t)/.07)*np.exp(-t*.8)
        if name=='bad':signal*=.9+.1*np.sin(t*math.tau*7)
        offset=round(start*RATE);end=min(len(data),offset+count)
        data[offset:end]+=signal[:end-offset]*envelope[:end-offset]*volume
    for repeat in range(2):
        for i,pitch in enumerate(MELODY):
            start=(repeat*24+i)*BEAT
            altered=pitch+(-1 if name=='bad' and i%7==3 else 0)
            note(altered+(12 if name=='good' else 0),start,BEAT*.82,.15,'pulse')
            root=[45,45,41,40][i//6]
            note(root if i%3==0 else root+7,start,BEAT*.9,.20,'triangle')
            if i%3:note(root+15+(1 if name=='bad' else 0),start,BEAT*.6,.075,'triangle')
    fade=np.minimum(1,np.arange(len(data))/(RATE*.3))*np.minimum(1,np.arange(len(data))[::-1]/(RATE*.7))
    pcm=np.clip(data*fade*.85,-1,1)
    # 8-bit PCM is intentional: compact and broadly decodable without an encoder dependency.
    with wave.open(str(OUT/(name+'.wav')),'wb') as out:
        out.setnchannels(1);out.setsampwidth(1);out.setframerate(RATE)
        out.writeframes(np.rint((pcm+1)*127.5).astype(np.uint8).tobytes())
    print(name, round(length,2), 'seconds')
