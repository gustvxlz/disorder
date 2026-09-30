import { archiveFolders } from '../narrative/MissionData.js';

export function furnishProtocol(w) {
  w.place('desk',-1.4,0,7.7,Math.PI);w.solid(-1.4,7.7,1.58,.8);
  w.place('office_chair',-1.4,0,8.6,Math.PI);w.solid(-1.4,8.6,.56,.56);
  const terminal=w.place('crt',-1.65,.79,7.72,Math.PI,false);
  w.interaction.register(terminal,{canInteract:()=>true,getInteractionText:()=>'[E] Usar computador',interact:()=>w.game.openComputer('protocol')});
  w.place('keyboard',-1.65,.79,7.36,Math.PI);
  w.place('mouse',-1.27,.79,7.37,Math.PI);
  w.place('computer',-.8,0,7.78,Math.PI);
  w.computerScreens.set('protocol',w.screens.add(w.scene,'intranet',-1.65,1.065,7.501,Math.PI));
  const phone=w.place('telephone',-.91,.79,7.46,Math.PI,false);
  w.interaction.register(phone,{canInteract:()=>true,getInteractionText:()=>!w.game.world.flags.introCallHeard||w.game.world.flags.phonePending?'[E] Atender':'[E] Telefone',interact:()=>w.game.answerPhone()});
  w.phonePosition.set(-.91,.9,7.46);
  w.place('desk',-3.6,0,8.5,Math.PI/2);w.solid(-3.6,8.5,.8,1.58);
  const printer=w.place('printer',-3.6,.79,8.5,Math.PI/2,false);w.printer=printer;
  w.interaction.register(printer,{canInteract:()=>true,getInteractionText:()=>'[E] Impressora',interact:()=>w.game.openMissionPanel('printer')});
  w.entityPaper=w.place('folder',-3.3,.88,8.5,Math.PI/2,false);w.entityPaper.scale.set(.65,1,.7);w.entityPaper.visible=w.game.world.story.entityHeard;
  w.interaction.register(w.entityPaper,{canInteract:()=>w.entityPaper.visible,getInteractionText:()=>'[E] Ler impressão sem remetente',interact:()=>w.game.openMissionPanel('entity')});
  w.place('cabinet',3.9,0,10.35,Math.PI);w.solid(3.9,10.35,.92,.5);
  const drawer=w.place('filing_cabinet',2.65,0,10.35,Math.PI,false);w.solid(2.65,10.35,.52,.64);
  w.interaction.register(drawer,{canInteract:()=>true,getInteractionText:()=>'[E] Gaveteiro',interact:()=>w.game.openMissionPanel('drawer')});
  w.place('bin',-2.42,0,7.8);w.solid(-2.42,7.8,.3,.3);
  w.place('chair',3.85,0,5,Math.PI/2);w.solid(3.85,5,.55,.55);
  w.place('mug',-1.95,.79,7.48);
  w.place('folder',-1.08,.79,7.82,.22);
  for(let i=0;i<6;i++)w.place('binder',-3.6,.79,7.95+i*.075,Math.PI/2);
  w.label('PROTOCOLO\n03 / TURNO NOTURNO',0,2.32,3.1,1.16,.38);
  w.label('QUADRO DE CHAVES',4.86,1.96,5.9,1,.25,-Math.PI/2);
  const keys=w.place('key_board',4.84,1.49,5.9,-Math.PI/2,false);
  w.cardBadge=w.labels.make('B',4.765,1.49,5.9,.11,.17,-Math.PI/2);
  w.cardBadge.userData.ownedGeometry=true;
  w.cardBadge.visible=!w.game.world.inventory.includes('archive-card');w.scene.add(w.cardBadge);
  w.interaction.register(keys,{canInteract:()=>true,getInteractionText:()=>'[E] Quadro de chaves',interact:()=>w.game.openMissionPanel('keys')});
  w.label('CARTÃO B\nARQUIVO · USO COMPARTILHADO',4.86,2.27,5.9,1.1,.28,-Math.PI/2);
  w.label('ORGANIZAÇÃO É CONTINUIDADE\nARQUIVE. CONFIRA. REGISTRE.',-3.1,1.95,10.87,1.2,.6,Math.PI);
  w.place('desk_cables',-1.4,0,7.7,Math.PI);
  w.place('paper_tray',-3.6,.79,8.95,Math.PI/2);
  w.place('stapler',-3.42,.79,8.72,.3);
  w.place('photo_frame',-1.92,.79,7.91,Math.PI);
  const notice=w.place('noticeboard',4.87,1.7,7.7,-Math.PI/2,false);
  w.interaction.register(notice,{canInteract:()=>true,getInteractionText:()=>'[E] Ler aviso interno',interact:()=>w.game.openMissionPanel('memo')});
  w.place('desk',1.4,0,9.7,Math.PI);w.solid(1.4,9.7,1.58,.8);
  w.place('chair',1.4,0,10.45,Math.PI);w.solid(1.4,10.45,.5,.5);
  w.place('paper_tray',1.75,.79,9.55,Math.PI);
  for(let i=0;i<4;i++)w.place('binder',.88+i*.076,.79,9.8,Math.PI);
  w.place('folder',1.3,.79,9.45,-.08);
  w.place('stapler',1.65,.79,9.85);
  workstation(w,'desk','cat',1.4,9.58,0);
  const coffee=w.place('cup',.65,.79,9.5,0,false);
  w.interaction.register(coffee,{canInteract:()=>true,getInteractionText:()=>'[E] Tomar café',interact:()=>{w.audio.interact();w.game.ui.toast('Ainda quente. Antônio acertou o café desta vez.');}});
  w.interaction.register(w.place('photo_frame',2,.79,9.73,0,false),{canInteract:()=>true,getInteractionText:()=>'[E] Olhar fotografia',interact:()=>w.game.ui.toast('Um cachorro dormindo dentro de uma caixa. “Adotado pelo setor — 2004”.')});
  w.place('outlet',-4.87,.28,8.15,Math.PI/2);
  lightSwitch(w,.9,1.18,3.09,0,'protocol');
}

export function furnishCorridor(w) {
  w.label('SETOR DE ARQUIVO  ←\nPROTOCOLO  →',0,2.3,-10.13,1.5,.38);
  w.label('ARQUIVO B',-4.88,2.32,-12.5,1.15,.3,Math.PI/2);
  w.label('ALA LESTE\nSEM ACESSO NESTE TURNO',4.86,2.3,-12.5,1.1,.3,-Math.PI/2);
  const cooler=w.place('water_cooler',-1.16,0,-6,Math.PI/2,false);w.solid(-1.16,-6,.36,.36);
  w.interaction.register(cooler,{canInteract:()=>true,getInteractionText:()=>'[E] Beber água',interact:()=>{w.audio.water(cooler.position);w.game.ui.toast('Água fria. A bomba faz aquele ruído de sempre.');}});
  w.place('cup',-1.15,1.16,-6.15);
  w.place('extinguisher',1.29,.28,-3,-Math.PI/2);
  w.place('chair',1.08,0,-7,-Math.PI/2);w.solid(1.08,-7,.5,.5);
  const notice=w.place('noticeboard',-1.39,1.65,-1,Math.PI/2,false);
  w.interaction.register(notice,{canInteract:()=>true,getInteractionText:()=>'[E] Ler aviso interno',interact:()=>w.game.openMissionPanel('memo')});
  w.label('AVISOS · USO INTERNO',-1.34,2.12,-1,1.0,.16,Math.PI/2);
  lightSwitch(w,1.4,1.2,1,-Math.PI/2,'corridor');
  w.place('outlet',1.4,.28,-5,-Math.PI/2);
  w.label('EXTINTOR',1.39,1.5,-3,.3,.13,-Math.PI/2);
  w.place('desk',3.25,0,-13.8);w.solid(3.25,-13.8,1.6,.8);
  w.place('chair',3.25,0,-14.55);w.solid(3.25,-14.55,.5,.5);
  for(let i=0;i<3;i++)w.place('binder',2.63+i*.075,.79,-13.85);
  w.place('folder',3.85,.79,-13.7,.13);
  w.place('mug',3.6,.79,-14.05);
  w.place('filing_cabinet',4.3,0,-14.45);w.solid(4.3,-14.45,.55,.65);
  w.label('MARTA\nADMINISTRAÇÃO',3.25,.95,-13.37,.4,.17);
  w.place('paper_tray',3.48,.79,-13.9);
  w.place('stapler',3.1,.79,-13.62);
  w.place('noticeboard',-2.9,1.7,-14.87);
  workstation(w,'marta','marta',3.25,-13.85,Math.PI);
  w.place('desk',-2.8,0,-14.05);w.solid(-2.8,-14.05,1.6,.8);
  w.place('chair',-2.8,0,-14.7);w.solid(-2.8,-14.7,.5,.5);
  w.place('folder',-2.5,.79,-14.04);w.place('paper_tray',-3.15,.79,-14.07);
  w.label('ADMINISTRAÇÃO\nMARTA · FECHAMENTO MENSAL',0,2.3,-10.16,1.5,.35);
}

export function furnishArchive(w) {
  const shelves=[[-12.7,-16.8],[-10.8,-16.8],[-8.9,-16.8],[-6.8,-16.8],[-12.7,-12],[-10.8,-12],[-12.7,-14.6],[-10.8,-14.6]];
  shelves.forEach(([x,z],index)=>{
    w.place('shelf',x,0,z);w.solid(x,z,1.55,.6);
    for(const y of [.15,.65,1.15,1.65]) for(let i=0;i<3;i++) {
      if(index===2&&y===1.15)continue;
      const ambient=index===3&&y===1.15&&i===1;
      const box=w.place('archive_box',x-.48+i*.47,y,z,(i+index)%4===0?.035:0,!ambient);
      if(ambient)w.interaction.register(box,{canInteract:()=>true,getInteractionText:()=>'[E] Ler etiqueta da caixa',interact:()=>w.game.inspectBox('A-14')});
    }
    w.label(`PRATELEIRA ${String(index===2?3:index+1).padStart(2,'0')}`,x,2.2,z+.29,.7,.18);
  });
  w.folderMeshes=new Map();
  archiveFolders.forEach((folder,index)=>{
    const x=-9.37+index*.47,z=-16.8;
    const model=w.place('binder',x,1.15,z,0,false);model.scale.x=3;
    w.label(`${folder.month}\n${folder.title}`,x,1.32,z+.17,.36,.16);
    w.folderMeshes.set(folder.code,model);
    w.interaction.register(model,{canInteract:()=>!w.game.world.story.routineSubmitted&&w.game.world.story.folderCode!==folder.code,getInteractionText:()=>`[E] Pasta ${folder.code}`,interact:()=>w.game.inspectFolder(folder.code)});
  });
  w.label('INVENTÁRIOS MENSAIS\nORDEM: MÊS / ANO',-8.9,2.05,-16.48,1.35,.35);
  w.label('PASTAS: PRATELEIRA 03\nCAIXAS: DOCUMENTOS AVULSOS',-5.25,1.7,-11.4,.95,.3,-Math.PI/2);
  w.refreshFolders();
  w.label('ARQUIVO B\nPRATELEIRAS 01 — 08',-13.87,2.1,-14,1.5,.45,Math.PI/2);
  w.place('archive_cart',-12.8,0,-13.25,Math.PI/2);w.solid(-12.8,-13.25,.48,.68);
  for(let i=0;i<5;i++)w.place('binder',-12.8+i*.074,1.66,-12.03);
  w.place('folder',-12.72,.18,-13.25,.12);
  lightSwitch(w,-5.1,1.18,-13.35,-Math.PI/2,'archive');
}

function workstation(w,station,kind,x,z,rotation) {
  const pc=w.place('crt',x,.79,z,rotation,false);
  w.place('keyboard',x,.79,z+Math.cos(rotation)*.34,rotation);
  w.place('mouse',x+.36,.79,z+Math.cos(rotation)*.34,rotation);
  w.computerScreens.set(station,w.screens.add(w.scene,kind,x,1.065,z+Math.cos(rotation)*.219,rotation));
  w.interaction.register(pc,{canInteract:()=>true,getInteractionText:()=>'[E] Usar computador',interact:()=>w.game.openComputer(station)});
}

function lightSwitch(w,x,y,z,rotation,sector) {
  const mesh=w.place('switch',x,y,z,rotation,false);
  w.interaction.register(mesh,{canInteract:()=>!w.game.flow?.busy,getInteractionText:()=>'[E] Interruptor',interact:()=>w.toggleLight(sector)});
}
