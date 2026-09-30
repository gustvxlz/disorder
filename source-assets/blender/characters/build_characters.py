"""Reference-derived employees and protagonist. Pass -- --only protagonist for body work.
Run with Blender --background --python. Originals are never opened for writing.
Active characters share a 16-bone rig and ten named animation clips.
"""
import bpy
import math
import json
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/assets/models/characters'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(__file__).parent
VARIANTS = [
    ('supervisor', 'important', 'boss.png', 'suit', 'swept', 1.04),
    ('marta', 'important', 'colega_feminina.png', 'skirt', 'tied', .98),
    ('protagonist', 'important', 'main_character.png', 'suit', 'swept', 1.02),
    ('antonio', 'important', 'zelador.png', 'apron', 'receding', 1.02),
    ('office_01', 'generic', 'npc (1).png', 'cardigan', 'tied', .98),
    ('office_02', 'generic', 'npc (2).png', 'vest', 'messy', 1.02),
    ('office_03', 'generic', 'npc (3).png', 'skirt', 'bob', 1.0),
    ('office_04', 'generic', 'npc (4).png', 'shirt', 'receding', 1.01),
    ('office_05', 'generic', 'npc (5).png', 'shirt', 'short', 1.03),
]
CLIPS = ['idle', 'walk', 'talk', 'look', 'sit', 'stand', 'typing', 'work_at_desk', 'carry_folder', 'inspect_document']

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Roughness'].default_value = .94
    return mat

def build(name, category, reference, outfit, hair, height):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    mats = {key: material(key, color) for key, color in {
        'skin': (.68,.50,.38), 'shirt': (.70,.69,.62), 'cloth': (.115,.135,.135),
        'hair': (.10,.067,.046), 'shoe': (.035,.043,.043), 'white': (.89,.87,.77),
        'iris': (.17,.23,.18), 'tie': (.19,.10,.095), 'apron': (.34,.29,.18),
        'cardigan': (.32,.33,.32), 'metal': (.38,.39,.32), 'highlight': (.98,.96,.85),
        'badge': (.83,.81,.70),
    }.items()}
    pieces = []
    def finish(obj, label, mat, bone):
        obj.name = label
        obj.data.materials.append(mats[mat])
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1, 'REPLACE')
        pieces.append(obj)
        return obj
    def wedge(label, points, mat, bone, depth=.012):
        vertices=points+[(x,y+depth,z) for x,y,z in points]
        n=len(points)
        faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
        faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        mesh=bpy.data.meshes.new(label);mesh.from_pydata(vertices,[],faces);mesh.update()
        obj=bpy.data.objects.new(label,mesh);bpy.context.collection.objects.link(obj)
        return finish(obj,label,mat,bone)
    def ellipsoid(label, pos, scale, mat, bone, segments=16, rings=10):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=pos)
        obj = bpy.context.object
        obj.scale = scale
        return finish(obj, label, mat, bone)
    def block(label, pos, scale, mat, bone):
        bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
        obj = bpy.context.object
        obj.scale = scale
        return finish(obj, label, mat, bone)
    def taper(label, rings, mat, bone):
        vertices, faces = [], []
        sides = 12
        for x,y,z,rx,ry in rings:
            for i in range(sides):
                a = i*math.tau/sides
                vertices.append((x+math.cos(a)*rx, y+math.sin(a)*ry, z))
        for j in range(len(rings)-1):
            for i in range(sides):
                a=j*sides+i; b=j*sides+(i+1)%sides
                faces.append((a,b,b+sides,a+sides))
        faces += [tuple(reversed(range(sides))), tuple(range((len(rings)-1)*sides,len(rings)*sides))]
        mesh=bpy.data.meshes.new(label); mesh.from_pydata(vertices,[],faces);mesh.update()
        obj=bpy.data.objects.new(label,mesh);bpy.context.collection.objects.link(obj)
        return finish(obj,label,mat,bone)

    # Five-and-a-half-head silhouette; continuous garment volumes, not thin tubes.
    top = 'cloth' if outfit in ['suit','vest'] else 'cardigan' if outfit=='cardigan' else 'shirt'
    taper('tailored torso',[(0,0,.89,.205,.123),(0,0,1.02,.18,.118),(0,0,1.22,.245,.13),(0,0,1.34,.25,.10)],top,'spine')
    taper('neck',[(0,0,1.32,.064,.055),(0,0,1.48,.064,.055)],'skin','neck')
    # Ring-built cheek/jaw planes. Front flattened for facial readability.
    face=taper('shaped face',[(0,-.008,1.397,.057,.058),(0,0,1.43,.10,.095),
        (0,0,1.51,.147,.123),(0,0,1.61,.157,.13),(0,0,1.70,.142,.116),
        (0,.006,1.755,.088,.072),(0,.006,1.765,.012,.012)],'skin','head')
    for v in face.data.vertices:
        if v.co.y<-.087 and 1.49<v.co.z<1.68:v.co.y=-.126
    for x in [-.15,.15]: ellipsoid('ear',(x,.007,1.567),(.023,.029,.044),'skin','head',12,8)
    if name != 'protagonist':
        for x in [-.063,.063]:
            ellipsoid('eye outline',(x,-.129,1.603),(.046,.005,.027),'hair','head',20,10)
            ellipsoid('eye white',(x,-.135,1.601),(.041,.005,.022),'white','head',20,10)
            ellipsoid('iris',(x,-.141,1.601),(.021,.003,.021),'iris','head',20,10)
            ellipsoid('pupil',(x,-.145,1.601),(.010,.002,.017),'shoe','head',12,8)
            ellipsoid('eye glint',(x-.006,-.148,1.609),(.005,.002,.006),'highlight','head',8,6)
            brow=block('eyebrow',(x,-.129,1.647),(.072,.007,.009),'hair','head')
            brow.rotation_euler.y=(-.12 if x<0 else .12) if name=='supervisor' else 0
        wedge('small nose',[(-.013,-.129,1.57),(.013,-.129,1.57),(0,-.154,1.538)],'skin','head')
        block('quiet mouth',(0,-.116,1.476),(.041,.008,.005),'tie','head')
    # Hair cap does not cover the forehead/eyes. Different outlines per reference.
    ellipsoid('hair crown',(0,.015,1.722),(.16,.126,.062),'hair','head',20,12)
    if hair in ['tied','bob']:
        for x in [-.143,.143]:
            taper('temple lock',[(x,.014,1.69,.035,.094),(x,.006,1.54,.025,.055),(x*.93,-.055,1.41,.006,.012)],'hair','head')
        ellipsoid('hair back',(0,.101,1.61),(.135,.054,.12),'hair','head',16,10)
        if hair=='tied':
            ellipsoid('tied bun',(0,.158,1.63),(.069,.057,.074),'hair','head',16,10)
            block('hair ribbon',(0,.162,1.628),(.12,.011,.02),'cloth','head')
        # Parted swept fringe with an open forehead and asymmetric ends.
        for sign in [-1,1]:
            wedge('parted fringe',[(sign*.012,-.106,1.75),(sign*.12,-.106,1.727),
                (sign*.145,-.127,1.58),(sign*.078,-.137,1.675)],'hair','head',.04)
    elif hair=='receding':
        for x in [-.10,.10]: ellipsoid('side hair',(x,.017,1.671),(.019,.07,.06),'hair','head',10,8)
    elif hair=='swept':
        wedge('side parted sweep',[(-.145,-.098,1.755),(.104,-.112,1.76),(.153,-.129,1.672),(-.106,-.133,1.705)],'hair','head',.038)
        wedge('parting ridge',[(-.113,-.112,1.758),(-.070,-.11,1.778),(-.093,-.14,1.691)],'hair','head',.031)
        for sign in [-1,1]:
            wedge('tidy sideburn',[(sign*.145,.01,1.72),(sign*.16,-.06,1.64),(sign*.142,-.026,1.57)],'hair','head',.025)
    else:
        for i in range(4):
            x=-.13+i*.075
            wedge('swept fringe',[(x,-.09,1.764),(x+.081,-.086,1.735),
                (x+.035,-.13,1.661-(.035 if hair=='messy' and i==1 else 0))],'hair','head',.043)
        for sign in [-1,1]:
            wedge('sideburn',[(sign*.145,.01,1.72),(sign*.16,-.06,1.64),(sign*.142,-.026,1.56)],'hair','head',.025)
    for side,x in [('L',-.105),('R',.105)]:
        legmat='skin' if outfit=='skirt' else 'cloth'
        taper('thigh',[(x,0,.56 if outfit=='skirt' else .91,.075 if outfit=='skirt' else .098,.076 if outfit=='skirt' else .10),(x,0,.55,.075,.076),(x,0,.49,.065,.064)],legmat,'thigh_'+side)
        taper('shin',[(x,0,.49,.070,.068),(x,.015,.30,.074,.069),(x,0,.09,.054,.051)],legmat,'shin_'+side)
        shoe=block('square toe shoe',(x,-.044,.055),(.14,.23,.09),'shoe','foot_'+side)
        bevel=shoe.modifiers.new('Rounded toe','BEVEL');bevel.width=.026;bevel.segments=2
        bpy.context.view_layer.objects.active=shoe;bpy.ops.object.modifier_apply(modifier=bevel.name)
        block('shoe sole',(x,-.044,.018),(.143,.231,.02),'cloth','foot_'+side)
    if outfit=='skirt':
        skirt=taper('skirt',[(0,0,.95,.19,.115),(0,0,.71,.205,.135),(0,0,.54,.215,.135)],'cloth','hips')
        left=skirt.vertex_groups.new(name='thigh_L');right=skirt.vertex_groups.new(name='thigh_R')
        for vertex in skirt.data.vertices:
            amount=max(0,min(1,(.91-vertex.co.z)/.20))
            blend=max(0,min(1,(vertex.co.x+.06)/.12))
            skirt.vertex_groups['hips'].add([vertex.index],1-amount,'REPLACE')
            left.add([vertex.index],amount*(1-blend),'REPLACE');right.add([vertex.index],amount*blend,'REPLACE')
    if outfit=='apron':
        block('apron',(0,-.123,.96),(.34,.014,.70),'apron','spine')
        block('apron pocket',(0,-.138,.96),(.17,.01,.12),'cloth','spine')
        for x in [-.135,.135]: block('strap',(x,-.119,1.28),(.025,.014,.29),'apron','spine')
    else:
        block('shirt placket',(0,-.115,1.225),(.048,.016,.32),'shirt','spine')
        for x in [-.052,.052]:
            wedge('pointed collar',[(x-.044,-.123,1.335),(x+.044,-.123,1.335),(x,-.151,1.263)],'white','spine')
        if outfit in ['suit','shirt','vest']:
            taper('tie',[(0,-.131,1.37,.025,.006),(0,-.132,1.10,.036,.006),(0,-.132,1.06,.002,.006)],'tie','spine')
            if outfit=='suit':
                for x in [-.09,.09]:
                    lapel=block('lapel',(x,-.12,1.275),(.064,.016,.22),'cardigan','spine');lapel.rotation_euler.y=-x*3
        else:
            for z in [1.12,1.20,1.28]: block('button',(0,-.129,z),(.008,.004,.008),'shoe','spine')
    if name!='protagonist':
        block('badge',(-.13,-.123,1.29),(.065,.012,.085),'badge','spine')
        block('badge photo',(-.142,-.131,1.30),(.022,.003,.025),'cloth','spine')
    for side,sign in [('L',-1),('R',1)]:
        x=sign*.275
        sleeve='shirt' if outfit in ['vest','skirt','shirt','apron'] else top
        taper('shaped sleeve',[(x,0,1.325,.084,.085),(sign*.295,-.012,1.17,.077,.076),(sign*.305,-.014,1.10,.060,.062)],sleeve,'arm_'+side)
        taper('sleeve forearm',[(sign*.305,-.014,1.10,.060,.062),(sign*.31,-.03,.94,.052,.053)],sleeve,'forearm_'+side)
        taper('cuff',[(sign*.31,-.03,.945,.058,.057),(sign*.31,-.03,.918,.058,.057)],'white','forearm_'+side)
        ellipsoid('mitten hand',(sign*.31,-.033,.87),(.048,.037,.065),'skin','hand_'+side,12,8)
        ellipsoid('thumb',(sign*.276,-.055,.886),(.021,.024,.035),'skin','hand_'+side,10,6)
    # Reference-specific garment trim and a replaceable named badge surface.
    block('waistband',(0,-.117,.915),(.35,.012,.032),'cloth','hips')
    if outfit=='cardigan':
        for x in [-.084,.084]:block('cardigan opening',(x,-.129,1.15),(.024,.012,.36),'white','spine')
    if outfit=='suit':
        for x in [-.155,.155]:block('jacket pocket',(x,-.125,1.04),(.09,.008,.013),'shoe','spine')
    if name!='protagonist':
        block('badge clip',(-.13,-.138,1.33),(.027,.012,.018),'metal','spine')
        for z in [1.266,1.282]:block('badge writing',(-.115,-.138,z),(.024,.005,.004),'cloth','spine')
    if name in ['marta','office_01']:
        block('held clipboard',(.20,-.081,.96),(.28,.022,.29),'cloth','hand_R')
        block('held paper',(.20,-.095,.963),(.25,.006,.25),'white','hand_R')
        block('clipboard clip',(.20,-.100,1.10),(.07,.012,.022),'metal','hand_R')
        for z in [.92,.95,.98,1.01]:block('document rule',(.21,-.100,z),(.17,.003,.004),'cardigan','hand_R')

    bpy.ops.object.select_all(action='DESELECT')
    for obj in pieces: obj.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    bpy.ops.object.join();mesh=bpy.context.object;mesh.name=name+'_skin'
    # Apply object origin before binding: vertices retain their world-space positions.
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0))
    rig=bpy.context.object;rig.name=name
    bones=rig.data.edit_bones
    bones.remove(bones[0])
    def bone(label,head,tail,parent=None):
        b=bones.new(label);b.head=head;b.tail=tail
        if parent:b.parent=bones[parent]
    bone('hips',(0,0,.88),(0,0,1.0))
    bone('spine',(0,0,1.0),(0,0,1.34),'hips')
    bone('neck',(0,0,1.34),(0,0,1.43),'spine')
    bone('head',(0,0,1.43),(0,0,1.76),'neck')
    for side,sign in [('L',-1),('R',1)]:
        bone('thigh_'+side,(sign*.105,0,.88),(sign*.105,0,.49),'hips')
        bone('shin_'+side,(sign*.105,0,.49),(sign*.105,0,.09),'thigh_'+side)
        bone('foot_'+side,(sign*.105,0,.09),(sign*.105,-.11,.04),'shin_'+side)
        bone('arm_'+side,(sign*.275,0,1.325),(sign*.305,-.014,1.10),'spine')
        bone('forearm_'+side,(sign*.305,-.014,1.10),(sign*.31,-.03,.94),'arm_'+side)
        bone('hand_'+side,(sign*.31,-.03,.94),(sign*.31,-.033,.82),'forearm_'+side)
    bpy.ops.object.mode_set(mode='OBJECT')
    mesh.parent=rig
    modifier=mesh.modifiers.new('Shared office rig','ARMATURE');modifier.object=rig
    rig.scale=(height,height,height)
    bpy.context.scene.render.fps=24
    for clip in CLIPS:
        rig.animation_data_clear()
        for frame in range(1,50,6):
            t=(frame-1)/48*math.tau
            for pb in rig.pose.bones:
                pb.rotation_mode='XYZ';pb.rotation_euler=(0,0,0);pb.location=(0,0,0)
            pose=rig.pose.bones
            pose['spine'].rotation_euler.x=math.sin(t)*.024
            pose['hips'].location.x=math.sin(t)*.008
            pose['spine'].rotation_euler.z=math.sin(t)*.018
            pose['head'].rotation_euler.y=math.sin(t)*.06
            for side,sign in [('L',1),('R',-1)]:
                pose['arm_'+side].rotation_euler.x=-.045+math.sin(t)*.035*sign
            if clip=='walk':
                for side,sign in [('L',1),('R',-1)]:
                    pose['thigh_'+side].rotation_euler.x=math.sin(t)*.38*sign
                    pose['shin_'+side].rotation_euler.x=max(0,-math.sin(t)*sign)*.4
                    pose['arm_'+side].rotation_euler.x=-math.sin(t)*.22*sign
            if clip in ['sit','typing','work_at_desk']:
                pose['hips'].location.y=-.43
                for side in ['L','R']:
                    pose['thigh_'+side].rotation_euler.x=-math.pi/2
                    pose['shin_'+side].rotation_euler.x=math.pi/2
            if clip in ['typing','work_at_desk','carry_folder','inspect_document']:
                for side in ['L','R']:
                    pose['forearm_'+side].rotation_euler.x=-1.20+math.sin(t+(0 if side=='L' else 1))*.10
                    pose['arm_'+side].rotation_euler.x=-.24
                    pose['arm_'+side].rotation_euler.z=.19*(1 if side=='L' else -1)
            if clip=='talk':
                pose['forearm_R'].rotation_euler.x=-.7+math.sin(t)*.20
                pose['arm_R'].rotation_euler.x=-.15
                pose['head'].rotation_euler.x=math.sin(t)*.065
            if clip in ['look','talk']:pose['head'].rotation_euler.y=math.sin(t)*.19
            if clip in ['typing','work_at_desk']:
                for side in ['L','R']:pose['hand_'+side].rotation_euler.x=math.sin(t*2+(0 if side=='L' else 1.5))*.15
            if clip=='inspect_document':pose['head'].rotation_euler.x=.17
            if clip=='stand':pose['hips'].location.y=-.43*(1-(frame-1)/48)
            for pb in pose:
                pb.keyframe_insert('rotation_euler',frame=frame)
                pb.keyframe_insert('location',frame=frame)
        action=rig.animation_data.action;action.name=clip
        track=rig.animation_data.nla_tracks.new();track.name=clip
        track.strips.new(clip,1,action)
        # Keep clips separately in NLA; export all tracks after accumulating actions.
        action.use_fake_user=True
    rig.animation_data_clear()
    rig.animation_data_create()
    for clip in CLIPS:
        action=bpy.data.actions.get(clip)
        track=rig.animation_data.nla_tracks.new();track.name=clip
        strip=track.strips.new(clip,1,action)
        if action.slots:strip.action_slot=action.slots[0]
        track.mute=True
    for pb in rig.pose.bones:pb.rotation_euler=(0,0,0);pb.location=(0,0,0)
    bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);mesh.select_set(True)
    folder=OUT/category;folder.mkdir(exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(folder/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips_merged_animation_name='idle')
    source=SOURCE/category;source.mkdir(exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(source/(name+'.blend')))
    tris=sum(len(p.vertices)-2 for p in mesh.data.polygons)
    # Remove orphan actions before building next character to keep exact clip names.
    for action in list(bpy.data.actions):bpy.data.actions.remove(action)
    return {'id':name,'category':category,'reference':reference,'triangles':tris,'bones':len(rig.data.bones),'animations':CLIPS}

previous=json.loads((OUT/'manifest.json').read_text()) if (OUT/'manifest.json').exists() else []
active={'marta','supervisor','office_01','office_02','protagonist'}
if '--only' in sys.argv:
    active={sys.argv[sys.argv.index('--only')+1]}
updated={variant[0]:build(*variant) for variant in VARIANTS if variant[0] in active}
manifest=[updated.get(entry['id'],entry) for entry in previous] if previous else list(updated.values())
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('CHARACTER_MANIFEST',json.dumps(manifest))
