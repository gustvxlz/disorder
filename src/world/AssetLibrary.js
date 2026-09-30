import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

export class AssetLibrary {
  async load() {
    const base = import.meta.env.BASE_URL + 'assets/';
    const textureLoader = new THREE.TextureLoader();
    this.textures = {};
    await Promise.all(['wall-a','wall-b','wood','painted-metal','carpet','paper','ceiling','linoleum','props-atlas','contact-shadow'].map(async name => {
      const texture = await textureLoader.loadAsync(`${base}textures/${name}.webp`);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestMipmapNearestFilter;
      texture.anisotropy = 1;
      // glTF UVs already use the top-left image convention; replacement must match it.
      if(name==='props-atlas')texture.flipY=false;
      this.textures[name] = texture;
    }));
    const gltf = await new GLTFLoader().loadAsync(`${base}models/office-kit.glb`);
    this.templates = new Map(gltf.scene.children.map(object => [object.name, object]));
    const maps = { Plaster: 'wall-a', Wood: 'wood', Metal: 'painted-metal', Paper: 'paper', Cardboard: 'paper' };
    const seen = new Set();
    gltf.scene.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true; object.receiveShadow = true;
      const material = object.material;
      if (seen.has(material)) return;
      seen.add(material);
      if(material.name==='OfficeAtlas')material.map=this.textures['props-atlas'];
      if (maps[material.name]) {
        material.map = this.textures[maps[material.name]];
        if (material.name !== 'Cardboard') material.color.set(0xffffff);
      }
    });
    this.floorMaterial = new THREE.MeshStandardMaterial({ map: this.textures.linoleum, roughness: .9 });
    this.carpetMaterial = new THREE.MeshStandardMaterial({ map: this.textures.carpet, roughness: 1 });
    this.shadowMaterial=new THREE.MeshBasicMaterial({map:this.textures['contact-shadow'],transparent:true,depthWrite:false});
    this.ceilingMaterial = new THREE.MeshStandardMaterial({ map: this.textures.ceiling, roughness: 1, color: 0xc8c9b5 });
    const plaster = [...seen].find(material => material.name === 'Plaster');
    this.wallVariant = plaster.clone();
    this.wallVariant.map = this.textures['wall-b'];
    this.characters=new Map();
    await Promise.all(['important/marta','important/supervisor','generic/office_01','generic/office_02'].map(async path=>{
      const model=await new GLTFLoader().loadAsync(`${base}models/characters/${path}.glb`);
      this.characters.set(path.split('/')[1],model);
    }));
  }

  character(name) {
    const model=this.characters.get(name);
    if(!model)throw new Error(`Missing character: ${name}`);
    return {root:cloneSkeleton(model.scene),animations:model.animations};
  }

  clone(name, variant = false) {
    const model = this.templates.get(name);
    if (!model) throw new Error(`Missing model: ${name}`);
    const copy = model.clone(true);
    copy.traverse(object => {
      if (!object.isMesh || object.material.name !== 'Plaster') return;
      if (name === 'ceiling_panel' && this.ceilingMaterial) object.material = this.ceilingMaterial;
      else if (variant && this.wallVariant) object.material = this.wallVariant;
    });
    return copy;
  }
}

// Merge static geometry by shared material once, leaving doors/NPCs/interactables independent.
export function batchStatic(root, scene) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  root.traverse(object => {
    if (!object.isMesh || !object.visible) return;
    let geometry = object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    if (geometry.index) geometry = geometry.toNonIndexed();
    for (const name of Object.keys(geometry.attributes)) if (!['position','normal','uv'].includes(name)) geometry.deleteAttribute(name);
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    if (!geometry.attributes.uv) geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
    const material = object.material;
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(geometry);
  });
  for (const [material, geometries] of buckets) {
    const mesh = new THREE.Mesh(mergeGeometries(geometries, false), material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.ownedGeometry = true;
    scene.add(mesh);
    for (const geometry of geometries) geometry.dispose();
  }
  scene.remove(root);
}
