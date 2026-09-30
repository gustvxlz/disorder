"""DISORDER original modular office kit. Run with Blender --background --python."""
import bpy
import math
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/assets/models'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
M = {}
for name, color, rough, metallic in [
    ('Plaster', (.63,.62,.53), .95,0), ('Institutional',(.22,.32,.29),.85,0),
    ('Wood',(.38,.25,.14),.8,0), ('Metal',(.34,.4,.37),.65,.3),
    ('Plastic',(.68,.65,.5),.8,0), ('Dark',(.07,.09,.085),.82,0),
    ('Paper',(.76,.72,.59),1,0), ('Cardboard',(.47,.38,.24),.95,0),
    ('Glass',(.08,.17,.15),.28,.1), ('Light',(.77,.85,.7),.5,0),
    ('Skin',(.58,.39,.27),.92,0), ('Hair',(.09,.065,.045),.9,0),
    ('Blouse',(.36,.43,.43),.9,0), ('Trousers',(.16,.18,.18),.9,0),
    ('Red',(.4,.12,.085),.72,0), ('Ceramic',(.55,.57,.47),.42,0),
]:
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color,1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color,1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
    if name == 'Light':
        bsdf.inputs['Emission Color'].default_value = (*color,1)
        bsdf.inputs['Emission Strength'].default_value = 2
    M[name] = mat

assets = []
parent = None
def asset(name):
    global parent
    parent = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(parent)
    assets.append(parent)
    return parent

def finish(obj, name, mat, bevel=0):
    obj.name = name
    obj.data.materials.append(M[mat])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 2
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        normal = obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=normal.name)
    obj.parent = parent
    return obj

def box(name, pos, size, mat, bevel=.008):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj=bpy.context.object
    obj.dimensions=size
    return finish(obj,name,mat,bevel)

def cylinder(name,pos,radius,depth,mat,vertices=16,rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=pos,rotation=rotation)
    return finish(bpy.context.object,name,mat,.003)

def sphere(name,pos,scale,mat,segments=16,rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=pos)
    obj=bpy.context.object
    obj.scale=scale
    obj=finish(obj,name,mat)
    for poly in obj.data.polygons: poly.use_smooth=True
    return obj

def rod(name,a,b,r,mat):
    a,b=Vector(a),Vector(b)
    obj=cylinder(name,(a+b)/2,r,(b-a).length,mat,12)
    obj.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return obj

asset('wall')
box('plaster',(0,0,1.4),(2,.14,2.8),'Plaster',.004)
box('lower paint',(0,-.08,.56),(2,.015,1.12),'Institutional',0)
asset('corner')
box('corner upright',(0,0,1.4),(.18,.18,2.8),'Institutional')
asset('baseboard')
box('baseboard',(0,0,.06),(2,.035,.12),'Dark',.004)
asset('ceiling')
box('tile',(0,0,0),(.98,.98,.025),'Plaster',.005)
asset('ceiling_panel')
box('frame',(0,0,0),(1,1,.035),'Metal',.002)
box('inset',(0,0,-.022),(.94,.94,.025),'Plaster',.001)
asset('fluorescent')
box('housing',(0,0,0),(1.2,.3,.09),'Plastic',.02)
for y in [-.08,.08]: cylinder('tube',(0,y,-.065),.025,1.05,'Light',12,(0,math.pi/2,0))
for x in [-.46,-.23,0,.23,.46]: box('louver',(x,0,-.073),(.018,.27,.07),'Metal',.001)
asset('door_frame')
for x in [-.54,.54]: box('jamb',(x,0,1.05),(.09,.2,2.1),'Wood')
box('lintel',(0,0,2.12),(1.16,.2,.1),'Wood')
asset('door')
# Pivot is the left hinge; front points -Y in Blender (+Z in glTF).
box('leaf',(.49,0,1.025),(.98,.055,2.05),'Wood',.012)
box('inset panel',(.49,-.03,1.05),(.77,.01,1.72),'Institutional',.005)
for y in [-.047,.047]:
    cylinder('handle rose',(.84,y,1.02),.04,.015,'Metal',16,(math.pi/2,0,0))
    box('lever',(.79,y*1.8,1.025),(.17,.026,.026),'Metal',.012)
asset('desk')
box('laminated top',(0,0,.75),(1.55,.77,.07),'Wood',.022)
box('modesty panel',(0,.28,.43),(1.34,.04,.54),'Wood')
for x in [-.65,.65]:
    for y in [-.28,.28]: box('leg',(x,y,.36),(.055,.055,.72),'Metal',.008)
box('drawer pedestal',(.47,0,.42),(.37,.62,.54),'Plastic',.015)
for z in [.27,.44,.61]:
    box('drawer face',(.47,-.321,z),(.34,.025,.15),'Plastic')
    box('drawer pull',(.47,-.35,z),(.13,.025,.018),'Metal')
asset('chair')
box('seat',(0,0,.46),(.46,.44,.09),'Institutional',.035)
box('back',(0,.19,.78),(.45,.075,.48),'Institutional',.035)
for x in [-.18,.18]:
    for y in [-.16,.16]: rod('chair leg',(x,y,.43),(x*1.2,y*1.3,.03),.022,'Metal')
asset('office_chair')
cylinder('piston',(0,0,.25),.04,.4,'Metal')
box('padded seat',(0,0,.49),(.5,.46,.12),'Dark',.05)
box('padded back',(0,.21,.81),(.46,.12,.52),'Dark',.05)
for i in range(5):
    angle=i*math.tau/5
    x,y=math.cos(angle)*.3,math.sin(angle)*.3
    rod('star foot',(0,0,.13),(x,y,.07),.023,'Metal')
    cylinder('caster',(x,y,.045),.047,.04,'Dark',12,(math.pi/2,0,0))
for x in [-.29,.29]:
    rod('arm post',(x,0,.47),(x,0,.7),.018,'Metal')
    box('arm pad',(x,0,.72),(.065,.3,.045),'Dark',.02)
asset('cabinet')
box('body',(0,0,.92),(.9,.48,1.84),'Metal',.022)
for x in [-.215,.215]:
    box('door',(x,-.252,.95),(.42,.025,1.69),'Metal')
    box('pull',(x*.25,-.28,.96),(.025,.035,.18),'Dark')
for x in [-.35,.35]: box('foot',(x,0,.035),(.07,.38,.07),'Dark')
asset('filing_cabinet')
box('body',(0,0,.65),(.5,.62,1.3),'Metal',.015)
for z in [.19,.5,.81,1.12]:
    box('drawer',(0,-.324,z),(.45,.03,.275),'Metal')
    box('label frame',(0,-.345,z+.04),(.19,.015,.07),'Dark',.004)
    box('label',(0,-.355,z+.04),(.16,.005,.045),'Paper',0)
    box('pull',(0,-.37,z-.06),(.18,.04,.026),'Dark')
asset('shelf')
for x in [-.74,.74]:
    for y in [-.24,.24]: box('upright',(x,y,1.15),(.035,.035,2.3),'Metal',.003)
for z in [.12,.62,1.12,1.62,2.12]: box('shelf deck',(0,0,z),(1.53,.55,.04),'Metal',.006)
asset('shelf_board')
box('shelf',(0,0,0),(1.5,.54,.035),'Metal',.005)
asset('archive_box')
box('carton',(0,0,.18),(.38,.33,.36),'Cardboard',.013)
box('lid',(0,0,.365),(.4,.35,.045),'Cardboard',.007)
box('paper label',(0,-.171,.21),(.23,.005,.105),'Paper',.002)
box('hand slot',(0,-.176,.3),(.12,.006,.024),'Dark',.009)
asset('bin')
cylinder('bin',(0,0,.16),.14,.32,'Dark',16)
cylinder('rim',(0,0,.325),.153,.025,'Metal',16)
cylinder('inside',(0,0,.331),.128,.004,'Dark',16)
asset('crt')
box('rear housing',(0,.06,.25),(.44,.42,.37),'Plastic',.065)
box('front bezel',(0,-.17,.26),(.48,.055,.38),'Plastic',.035)
box('glass',(0,-.203,.275),(.385,.025,.277),'Glass',.022)
cylinder('pedestal',(0,0,.045),.12,.08,'Plastic')
box('foot',(0,0,.015),(.32,.26,.03),'Plastic',.025)
for i in range(5): box('vent',(.224,.04+i*.04,.25),(.005,.018,.16),'Dark',.002)
box('power button',(.18,-.207,.095),(.02,.01,.017),'Dark',.004)
asset('computer')
box('case',(0,0,.22),(.18,.39,.44),'Plastic',.018)
for z in [.34,.38]: box('drive',(0,-.202,z),(.145,.015,.024),'Dark',.003)
cylinder('power',(0,-.21,.15),.018,.01,'Metal',12,(math.pi/2,0,0))
asset('keyboard')
box('base',(0,0,.018),(.42,.15,.035),'Plastic',.014)
for row in range(4):
    for col in range(13): box('key',(-.18+col*.029,-.052+row*.03,.041),(.024,.024,.014),'Paper',0)
asset('mouse')
sphere('mouse',(0,0,.023),(.035,.055,.028),'Plastic')
rod('cable',(0,.045,.012),(0,.22,.012),.003,'Dark')
asset('telephone')
box('base',(0,0,.035),(.23,.21,.07),'Dark',.022)
for row in range(4):
    for col in range(3): box('key',(-.035+col*.035,-.065+row*.027,.077),(.024,.018,.012),'Plastic',0)
box('handset bridge',(0,.05,.135),(.25,.045,.045),'Dark',.02)
for x in [-.1,.1]: box('earpiece',(x,.04,.105),(.065,.085,.055),'Dark',.025)
asset('printer')
box('body',(0,0,.13),(.43,.35,.26),'Plastic',.035)
box('output slot',(0,-.18,.17),(.3,.012,.036),'Dark',.005)
box('paper tray',(0,-.23,.07),(.3,.19,.025),'Plastic')
box('page',(0,-.225,.087),(.21,.2,.002),'Paper',0)
asset('binder')
box('cover',(0,0,.16),(.065,.24,.32),'Institutional',.006)
box('pages',(.004,-.006,.16),(.052,.21,.29),'Paper',.002)
box('spine',(-.031,0,.16),(.009,.24,.32),'Institutional',.003)
asset('folder')
box('folder',(0,0,.008),(.24,.32,.016),'Paper',.002)
box('tab',(.075,.17,.008),(.07,.025,.016),'Cardboard',.002)
asset('cup')
cylinder('cup',(0,0,.047),.033,.094,'Paper',16)
cylinder('rim',(0,0,.097),.036,.008,'Paper',16)
asset('mug')
cylinder('mug',(0,0,.048),.042,.096,'Ceramic',20)
cylinder('coffee',(0,0,.095),.036,.003,'Wood',20)
bpy.ops.mesh.primitive_torus_add(major_radius=.03,minor_radius=.009,major_segments=16,minor_segments=8,location=(.05,0,.055),rotation=(math.pi/2,0,0))
finish(bpy.context.object,'handle','Ceramic')
asset('clock')
cylinder('rim',(0,0,0),.22,.055,'Dark',48,(math.pi/2,0,0))
cylinder('dial',(0,-.032,0),.195,.008,'Paper',48,(math.pi/2,0,0))
for i in range(12):
    a=i*math.tau/12
    marker=box('hour marker',(math.sin(a)*.167,-.04,math.cos(a)*.167),(.012,.005,.027),'Dark',0)
    marker.rotation_euler.y=a
asset('water_cooler')
box('body',(0,0,.47),(.34,.34,.85),'Plastic',.024)
box('recess',(0,-.176,.59),(.22,.02,.22),'Dark')
cylinder('bottle',(0,0,1.025),.115,.29,'Glass',20)
box('tap',(.06,-.2,.64),(.03,.05,.04),'Metal')
asset('extinguisher')
cylinder('tank',(0,0,.27),.085,.48,'Red',20)
box('handle',(0,0,.56),(.13,.035,.06),'Dark')
rod('hose',(.07,0,.48),(.12,-.02,.15),.012,'Dark')

# A neutral administrative worker, with separate head for a restrained look-at.
asset('marta')
for x in [-.105,.105]:
    sphere('shoe',(x,-.035,.055),(.095,.155,.065),'Dark',20,12)
    sphere('trouser leg',(x,0,.49),(.09,.105,.44),'Trousers',20,14)
sphere('hips',(0,0,.91),(.22,.13,.18),'Trousers',24,14)
sphere('blouse',(0,0,1.18),(.225,.15,.3),'Blouse',24,16)
box('collar left',(-.046,-.14,1.38),(.07,.018,.1),'Paper',.005).rotation_euler.y=-.3
box('collar right',(.046,-.14,1.38),(.07,.018,.1),'Paper',.005).rotation_euler.y=.3
for z in [1.02,1.11,1.2,1.29]: sphere('button',(0,-.151,z),(.007,.006,.007),'Dark',8,4)
for side in [-1,1]:
    rod('sleeve',(side*.21,0,1.36),(side*.285,-.015,1.08),.071,'Blouse')
    rod('forearm',(side*.285,-.015,1.08),(side*.19,-.14,.93),.046,'Skin')
    sphere('hand',(side*.185,-.15,.91),(.048,.035,.074),'Skin',16,10)
box('held folder',(0,-.17,.96),(.3,.028,.23),'Paper',.005)
cylinder('neck',(0,0,1.47),.06,.13,'Skin',20)
body_parent=parent
head=bpy.data.objects.new('MartaHead',None)
bpy.context.collection.objects.link(head)
head.parent=body_parent
head.location=(0,0,1.6)
parent=head
sphere('face',(0,-.008,0),(.105,.092,.145),'Skin',32,20)
sphere('nose',(0,-.102,-.004),(.018,.026,.024),'Skin',12,8)
for x in [-.038,.038]:
    sphere('eye',(x,-.09,.025),(.017,.008,.008),'Paper',12,6)
    sphere('iris',(x,-.097,.025),(.006,.004,.006),'Hair',10,6)
    brow=box('eyebrow',(x,-.091,.048),(.035,.006,.008),'Hair',.002)
box('mouth',(0,-.094,-.053),(.043,.006,.006),'Wood',.002)
# Hair cap and sides leave the face exposed.
sphere('hair crown',(0,.01,.083),(.113,.103,.088),'Hair',28,16)
for x in [-.099,.099]: sphere('hair side',(x,.012,-.015),(.025,.088,.123),'Hair',16,12)
sphere('hair back',(0,.07,.006),(.102,.057,.135),'Hair',24,16)
parent=body_parent

# Art pass uses the same named assets/origins to preserve gameplay placement.
exec(compile((Path(__file__).parent/'art_props.py').read_text(), 'art_props.py', 'exec'))

# Join each static asset by material into one mesh; preserve Marta's head hierarchy.
for root in assets:
    if root.name == 'marta': continue
    meshes=[obj for obj in root.children_recursive if obj.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for obj in meshes: obj.select_set(True)
    bpy.context.view_layer.objects.active=meshes[0]
    if len(meshes)>1:bpy.ops.object.join()
    joined=bpy.context.object
    joined.name=root.name+'_mesh'
    joined.parent=root

bpy.ops.object.select_all(action='DESELECT')
for root in assets:
    root.select_set(True)
    for obj in root.children_recursive: obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'office-kit.glb'),export_format='GLB',use_selection=True,export_apply=True)
manifest={root.name: sum(len(p.vertices)-2 for obj in root.children_recursive if obj.type=='MESH' for p in obj.data.polygons) for root in assets}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
for name,category in [('extinguisher','props'),('key_board','props'),('noticeboard','props'),('archive_cart','props'),('ceiling_panel','environment')]:
    root=next(root for root in assets if root.name==name)
    folder=Path(__file__).parent/category;folder.mkdir(exist_ok=True)
    bpy.data.libraries.write(str(folder/(name+'.blend')),{root,*root.children_recursive},fake_user=True)
for i,root in enumerate(assets): root.location=((i%6)*3,(i//6)*3,0)
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).parent/'office-kit.blend'))
print('DISORDER_KIT',json.dumps(manifest))
