"""Art details for the office kit. Executed by build_kit.py with its mesh helpers."""

def edit_asset(name):
    global parent
    parent=next(root for root in assets if root.name==name)

def cable(name,points,radius=.004):
    for a,b in zip(points,points[1:]):rod(name,a,b,radius,'Dark')

edit_asset('extinguisher')
for obj in list(parent.children):bpy.data.objects.remove(obj,do_unlink=True)
cylinder('pressure cylinder',(0,0,.275),.084,.40,'Red',16)
sphere('shoulder',(0,0,.475),(.084,.084,.05),'Red',16,8)
sphere('base',(0,0,.076),(.084,.084,.03),'Red',16,8)
cylinder('valve',(0,0,.535),.022,.07,'Metal',10)
for z in [.562,.59]:box('squeeze lever',(.025,0,z),(.16,.026,.014),'Dark',.003)
cylinder('gauge body',(-.025,-.027,.542),.025,.015,'Metal',12,(math.pi/2,0,0))
cylinder('pressure dial',(-.025,-.036,.542),.021,.005,'Paper',12,(math.pi/2,0,0))
rod('gauge needle',(-.025,-.040,.542),(-.016,-.040,.554),.002,'Dark')
bpy.ops.mesh.primitive_torus_add(major_radius=.014,minor_radius=.003,major_segments=12,minor_segments=4,location=(-.078,0,.561),rotation=(math.pi/2,0,0))
finish(bpy.context.object,'safety pin','Metal')
cable('rubber hose',[(.022,.015,.542),(.091,.015,.51),(.122,.015,.41),(.123,.015,.21),(.096,-.006,.13)],.010)
cylinder('nozzle',(.096,-.006,.12),.018,.09,'Dark',10)
box('wall bracket',(0,.089,.27),(.12,.018,.27),'Metal',.003)
box('instructions',(0,-.084,.285),(.105,.003,.15),'Paper',0)
for z in [.265,.29,.315]:box('instruction rule',(0,-.087,z),(.073,.002,.005),'Dark',0)
box('red instruction heading',(0,-.087,.335),(.08,.002,.019),'Red',0)

edit_asset('crt')
for x in [-.225,.225]:
    for z in [.19,.23,.27,.31]:box('side vent',(x,.08,z),(.005,.19,.011),'Dark',0)
box('maker mark',(0,-.207,.105),(.069,.004,.012),'Metal',0)
box('power indicator',(.155,-.211,.095),(.009,.004,.009),'Institutional',0)
edit_asset('computer')
for z in [.10,.13,.16,.19,.22]:box('side intake',(.093,.03,z),(.004,.23,.009),'Dark',0)
box('drive eject',(.062,-.213,.34),(.012,.004,.007),'Paper',0)
box('asset sticker',(-.034,-.209,.08),(.057,.004,.025),'Paper',0)
edit_asset('keyboard')
box('spacebar',(-.055,-.055,.054),(.14,.024,.009),'Paper',0)
for x in [.13,.15,.17]:box('status led',(x,.057,.04),(.006,.005,.004),'Institutional',0)
edit_asset('telephone')
box('number label',(0,-.095,.076),(.15,.014,.002),'Paper',0)
cable('handset cord',[(.12,.045,.115),(.155,.043,.075),(.15,-.05,.015),(.11,-.12,.015),(.075,-.12,.028)],.005)
for i in range(8):
    x=.14+(i%2)*.015;y=.035-i*.011
    rod('coiled cord',(x,y,.03),(x+.012,y-.008,.03),.003,'Dark')
edit_asset('printer')
box('control panel',(.135,-.095,.267),(.08,.06,.01),'Dark',.004)
for x in [.12,.15]:box('printer button',(x,-.095,.275),(.016,.017,.009),'Metal',.002)
box('rear paper support',(0,.167,.245),(.29,.025,.27),'Plastic',.006)
box('input pages',(0,.15,.28),(.22,.008,.29),'Paper',0)
edit_asset('desk')
box('top edge band',(0,-.384,.749),(1.50,.006,.04),'Dark',0)
edit_asset('chair')
for x in [-.17,.17]:rod('back support',(x,.18,.43),(x,.21,.94),.016,'Metal')
edit_asset('office_chair')
rod('back bracket',(0,.2,.41),(0,.24,.91),.025,'Metal')
box('tilt lever',(.22,0,.36),(.15,.02,.02),'Dark',.005)
edit_asset('cabinet')
for x in [-.22,.22]:
    for z in [.19,.23,.27]:box('door vent',(x,-.269,z),(.26,.004,.012),'Dark',0)
    box('cabinet label',(x,-.271,1.49),(.13,.004,.045),'Paper',0)
edit_asset('shelf')
for x in [-.74,.74]:
    for z in [.4,.9,1.4,1.9]:box('adjustment slot',(x,-.26,z),(.014,.003,.017),'Dark',0)
for z in [.12,.62,1.12,1.62,2.12]:box('shelf folded lip',(0,-.273,z-.018),(1.5,.015,.037),'Metal',.002)
edit_asset('archive_box')
box('lid seam',(0,-.178,.34),(.38,.003,.006),'Dark',0)
for x in [-.08,0,.08]:box('label rule',(x,-.178,.195),(.04,.002,.005),'Dark',0)
edit_asset('binder')
box('spine label',(-.039,0,.20),(.004,.12,.07),'Paper',0)
cylinder('finger hole',(-.041,0,.06),.013,.006,'Dark',10,(0,math.pi/2,0))
edit_asset('water_cooler')
cylinder('bottle shoulder',(0,0,1.18),.098,.07,'Glass',16)
cylinder('bottle neck',(0,0,.895),.046,.08,'Glass',12)
for z in [.99,1.07,1.15]:cylinder('bottle rib',(0,0,z),.12,.012,'Glass',16)
box('drip tray',(0,-.22,.46),(.24,.14,.035),'Metal',.004)
box('second tap',(-.055,-.20,.64),(.03,.05,.04),'Plastic',.003)
edit_asset('door')
box('kick plate',(.49,-.034,.18),(.82,.005,.22),'Metal',.003)
for z in [.22,1.05,1.83]:cylinder('hinge barrel',(.005,.035,z),.015,.08,'Metal',10)
edit_asset('fluorescent')
for x in [-.54,.54]:box('tube socket',(x,0,-.058),(.048,.22,.044),'Plastic',.003)

asset('noticeboard')
box('cork',(0,0,0),(1.2,.035,.72),'Cardboard',.005)
for x in [-.62,.62]:box('side frame',(x,-.025,0),(.04,.035,.79),'Wood',.005)
for z in [-.38,.38]:box('horizontal frame',(0,-.025,z),(1.28,.035,.04),'Wood',.005)
for x,z,width,height in [(-.33,.11,.24,.31),(.04,.02,.28,.4),(.36,-.05,.21,.25)]:
    box('pinned page',(x,-.024,z),(width,.004,height),'Paper',0)
    cylinder('drawing pin',(x,-.03,z+height/2-.02),.007,.006,'Red',8,(math.pi/2,0,0))
    for dz in [-.07,-.025,.025]:box('notice writing',(x,-.028,z+dz),(width*.72,.002,.006),'Metal',0)
asset('key_board')
box('backboard',(0,0,0),(.72,.038,.40),'Wood',.004)
for i in range(5):
    x=-.27+i*.135
    rod('hook',(x,-.028,.07),(x,-.053,.075),.004,'Metal')
    bpy.ops.mesh.primitive_torus_add(major_radius=.02,minor_radius=.003,major_segments=12,minor_segments=4,location=(x,-.056,.023),rotation=(math.pi/2,0,0))
    finish(bpy.context.object,'keyring','Metal')
    box('key shaft',(x,-.058,-.029),(.008,.008,.065),'Metal',.001)
    box('key tooth',(x+.009,-.058,-.058),(.022,.008,.011),'Metal',.001)
    box('key tag',(x+.023,-.063,.02),(.034,.006,.039),'Paper',.002)
asset('paper_tray')
box('tray',(0,0,.02),(.28,.35,.035),'Metal',.006)
for x in [-.14,.14]:box('raised side',(x,0,.06),(.012,.35,.08),'Metal',.002)
box('paper stack',(0,0,.05),(.23,.30,.021),'Paper',0)
for z in [.047,.054,.061]:box('paper edge',(0,-.155,z),(.22,.002,.002),'Dark',0)
asset('stapler')
box('base',(0,0,.008),(.035,.11,.016),'Metal',.003)
box('handle',(0,.013,.038),(.032,.08,.026),'Dark',.007).rotation_euler.x=-.12
asset('photo_frame')
box('frame',(0,0,.10),(.15,.017,.19),'Wood',.008)
box('picture',(0,-.011,.10),(.125,.004,.16),'Paper',0)
box('horizon',(0,-.014,.065),(.125,.002,.06),'Institutional',0)
cylinder('sun',(.025,-.015,.144),.021,.002,'Plastic',12,(math.pi/2,0,0))
rod('frame stand',(0,.005,.15),(0,.07,.01),.007,'Metal')
asset('desk_cables')
cable('monitor lead',[(-.25,.12,.75),(-.28,.24,.74),(-.28,.33,.65),(-.20,.34,.2),(.2,.25,.05)])
cable('power lead',[(.2,.25,.05),(.4,.36,.015),(.68,.36,.015),(.72,.3,.13)])
asset('switch')
box('plate',(0,0,0),(.09,.014,.13),'Plastic',.004)
box('rocker',(0,-.014,0),(.04,.018,.066),'Paper',.003)
asset('outlet')
box('plate',(0,0,0),(.115,.014,.075),'Plastic',.004)
for x in [-.03,.03]:
    for dx in [-.012,.012]:box('socket slot',(x+dx,-.009,0),(.005,.003,.017),'Dark',0)
asset('ceiling_trim')
box('cove',(0,0,0),(2,.055,.07),'Plastic',.002)
asset('archive_cart')
for z in [.17,.66]:box('tray',(0,0,z),(.64,.43,.035),'Metal',.005)
for x in [-.29,.29]:
    for y in [-.185,.185]:
        rod('cart upright',(x,y,.13),(x,y,.8),.013,'Metal')
        cylinder('wheel',(x,y,.075),.06,.025,'Dark',12,(math.pi/2,0,0))
rod('cart handle',(-.29,.185,.8),(.29,.185,.8),.016,'Metal')
box('documents',(0,0,.72),(.35,.28,.085),'Paper',0)
asset('fluorescent_off')
box('housing',(0,0,0),(1.2,.3,.09),'Plastic',.02)
for y in [-.08,.08]:cylinder('unlit tube',(0,y,-.065),.025,1.05,'Paper',12,(0,math.pi/2,0))
for x in [-.46,0,.46]:box('louver',(x,0,-.073),(.018,.27,.07),'Metal',.001)

# Pack all ordinary props into one shared material; architecture keeps wall variants.
atlas=bpy.data.materials.new('OfficeAtlas');atlas.use_nodes=True
nodes=atlas.node_tree.nodes;shader=nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value=.87
image=nodes.new('ShaderNodeTexImage');image.image=bpy.data.images.load(str(ROOT/'source-assets/blender/environment/props-atlas.png'))
image.interpolation='Closest';atlas.node_tree.links.new(image.outputs['Color'],shader.inputs['Base Color'])
image.image.pack()
slots=['Plaster','Institutional','Wood','Metal','Plastic','Dark','Paper','Cardboard','Glass','Ceramic','Red','Skin','Hair','Blouse','Trousers','Light']
architecture={'wall','corner','baseboard','ceiling','ceiling_panel','ceiling_trim','marta'}
for root in assets:
    if root.name in architecture:continue
    for obj in root.children_recursive:
        if obj.type!='MESH':continue
        original=obj.data.materials[0].name
        if original=='Light':continue
        slot=slots.index(original);uv=obj.data.uv_layers.active
        if uv is None:uv=obj.data.uv_layers.new()
        for loop in uv.data:
            u,v=loop.uv
            loop.uv=((slot%4+.035+u*.93)/4,(3-slot//4+.035+v*.93)/4)
        obj.data.materials.clear();obj.data.materials.append(atlas)
