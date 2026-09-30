"""Offline inspection sheet, not an in-game screenshot."""
import bpy
import sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[3]
clip=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else None
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for i,name in enumerate(['marta','supervisor','office_02']):
    category='generic' if name.startswith('office') else 'important'
    with bpy.data.libraries.load(str(Path(__file__).parent/category/(name+'.blend')),link=False) as (source,target):
        target.objects=source.objects
    for obj in target.objects:
        if obj is not None:
            bpy.context.collection.objects.link(obj)
            if obj.parent is None:obj.location.x=(i-1)*.85
            if clip and obj.type=='ARMATURE':
                for track in obj.animation_data.nla_tracks:track.mute=track.name!=clip
bpy.ops.mesh.primitive_plane_add(size=200)
floor=bpy.context.object;mat=bpy.data.materials.new('Backdrop');mat.diffuse_color=(.24,.26,.24,1);floor.data.materials.append(mat)
bpy.ops.object.camera_add(location=(1,-6,2.35));cam=bpy.context.object
cam.rotation_euler=(Vector((0,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=3.15
scene=bpy.context.scene;scene.camera=cam
for position,power in [((-3,-4,5),650),((3,-2,3),250)]:
    bpy.ops.object.light_add(type='AREA',location=position);light=bpy.context.object
    light.data.energy=power;light.data.size=4
    light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1000;scene.render.resolution_y=850;scene.render.resolution_percentage=100
output=ROOT/'.cache/previews';output.mkdir(parents=True,exist_ok=True)
scene.frame_set(13)
scene.render.filepath=str(output/('characters-'+(clip or 'rest')+'.png'))
bpy.ops.render.render(write_still=True)
