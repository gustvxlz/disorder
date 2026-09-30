"""Original painted-pixel surfaces; no photos or author references are sampled."""
from pathlib import Path
from PIL import Image, ImageDraw
import random

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/textures'
SOURCE=ROOT/'source-assets/blender/environment'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE.mkdir(parents=True,exist_ok=True)
rng=random.Random(417)

def painted(size,color,kind='paint'):
    image=Image.new('RGB',(size,size),color);draw=ImageDraw.Draw(image)
    def tint(delta):return tuple(max(0,min(255,c+delta)) for c in color)
    for _ in range(28):
        x,y=rng.randrange(size),rng.randrange(size)
        draw.rectangle((x,y,x+rng.randrange(2,12),y+rng.randrange(2,8)),fill=tint(rng.choice([-3,-2,2,3])))
    if kind=='wood':
        for y in range(3,size,7):
            draw.line((0,y,size,y),fill=tint(-7));draw.line((0,y+1,size,y+1),fill=tint(3))
    elif kind=='carpet':
        for y in range(0,size,4):
            for x in range((y//4)%2,size,4):draw.point((x,y),fill=tint(-5))
    elif kind=='vinyl':
        for p in [0,size//2]:
            draw.line((p,0,p,size),fill=tint(-9));draw.line((0,p,size,p),fill=tint(-9))
        for _ in range(14):
            x,y=rng.randrange(size),rng.randrange(size);draw.line((x,y,x+3,y),fill=tint(-6))
    elif kind=='ceiling':
        for _ in range(90):draw.point((rng.randrange(size),rng.randrange(size)),fill=tint(-8))
    elif kind=='paper':draw.line((0,size-2,size,size-2),fill=tint(-8))
    return image

for name,size,color,kind in [
    ('wall-a',128,(181,176,152),'paint'),('wall-b',128,(169,171,151),'paint'),
    ('wood',128,(133,104,72),'wood'),('painted-metal',64,(106,123,112),'paint'),
    ('carpet',128,(77,91,86),'carpet'),('paper',64,(211,205,180),'paper'),
    ('ceiling',64,(181,183,163),'ceiling'),('linoleum',128,(114,123,106),'vinyl')]:
    painted(size,color,kind).save(OUT/f'{name}.webp',lossless=True,method=6)

# Shared 4×4 atlas. Slot order is mirrored by Blender's UV remapping pass.
slots=[('Plaster',(181,176,152),'paint'),('Institutional',(91,119,104),'paint'),
    ('Wood',(133,104,72),'wood'),('Metal',(106,123,112),'paint'),
    ('Plastic',(193,187,158),'paint'),('Dark',(34,44,40),'paint'),
    ('Paper',(211,205,180),'paper'),('Cardboard',(148,124,87),'paper'),
    ('Glass',(48,75,65),'paint'),('Ceramic',(157,170,149),'paint'),
    ('Red',(144,57,45),'paint'),('Skin',(185,145,117),'paint'),
    ('Hair',(58,44,33),'paint'),('Blouse',(120,143,139),'paint'),
    ('Trousers',(59,69,65),'paint'),('Light',(225,226,195),'paint')]
atlas=Image.new('RGB',(256,256))
for i,(_,color,kind) in enumerate(slots):atlas.paste(painted(64,color,kind),((i%4)*64,(i//4)*64))
atlas.save(SOURCE/'props-atlas.png')
atlas.save(OUT/'props-atlas.webp',lossless=True,method=6)
shadow=Image.new('RGBA',(64,64),(0,0,0,0));draw=ImageDraw.Draw(shadow)
for inset,alpha in [(1,8),(5,18),(9,32),(14,45)]:draw.ellipse((inset,inset,63-inset,63-inset),fill=(0,0,0,alpha))
shadow.save(OUT/'contact-shadow.webp',lossless=True,method=6)
print('Painted surfaces: 64–128 px; prop atlas: 256 px')
