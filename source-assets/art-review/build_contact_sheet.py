"""Arrange actual game screenshots without retouching the rendered artwork."""
from pathlib import Path
from PIL import Image, ImageDraw

folder = Path(__file__).parent / 'screenshots'
shots = [('protocol', 'Protocolo'), ('corridor', 'Corredor'),
         ('archive', 'Arquivo B'), ('marta', 'Marta'),
         ('generic-npc', 'NPC generico'), ('extinguisher', 'Extintor')]
sheet = Image.new('RGB', (1440, 1290), '#111613')
draw = ImageDraw.Draw(sheet)
for i, (name, title) in enumerate(shots):
    x, y = (i % 2) * 720, (i // 2) * 430
    draw.text((x + 16, y + 12), title, fill='#e1dfc1')
    with Image.open(folder / f'{name}.jpg') as image:
        image = image.resize((720, 404), Image.Resampling.NEAREST)
        sheet.paste(image, (x, y + 26))
sheet.save(folder / 'contact-sheet.jpg', quality=92)
