"""Offline model QA only: not a screenshot or validation of the running game."""
import bpy
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(Path(__file__).parent / 'office-kit.blend'))
layout = {'marta': (-1.25, 0, 0), 'desk': (.5, 0, 0), 'crt': (.3, 0, .79),
          'telephone': (1, -.2, .79), 'keyboard': (.3, -.33, .79), 'office_chair': (.5, .85, 0)}
for obj in list(bpy.context.scene.objects):
    if obj.parent is not None:
        continue
    visible = obj.name in layout
    for child in [obj, *obj.children_recursive]:
        child.hide_render = not visible
    if visible:
        obj.location = layout[obj.name]

bpy.ops.mesh.primitive_plane_add(size=200)
floor = bpy.context.object
material = bpy.data.materials.new('Preview floor')
material.diffuse_color = (.16, .19, .17, 1)
floor.data.materials.append(material)
bpy.ops.object.camera_add(location=(3, -6, 2.9))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, .9)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4.2
scene = bpy.context.scene
scene.camera = camera
for pos, energy, size in [((-3, -4, 6), 800, 5), ((4, 2, 4), 500, 3)]:
    bpy.ops.object.light_add(type='AREA', location=pos)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = energy, 'DISK', size
    light.rotation_euler = (Vector((0, 0, 1)) - light.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.render.resolution_x, scene.render.resolution_y = 1000, 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
output = root / 'dist/qa'
output.mkdir(parents=True, exist_ok=True)
scene.render.filepath = str(output / 'kit-preview.png')
bpy.ops.render.render(write_still=True)
