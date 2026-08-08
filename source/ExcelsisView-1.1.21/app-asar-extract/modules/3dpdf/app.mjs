import { looksLikePrcPdf, looksLikeU3dPdf } from './nano-prc.mjs';
import { createWorkerTaskClient } from '../shared/worker-client.mjs';

const cv=document.getElementById('cv'), drop=document.getElementById('drop'), hint=document.getElementById('hint'), stats=document.getElementById('stats');
const componentTree=document.getElementById('componentTree'), selectionCount=document.getElementById('selectionCount');
const modelOpacityInput=document.getElementById('modelOpacity'), componentOpacityInput=document.getElementById('componentOpacity');
const modelOpacityValue=document.getElementById('modelOpacityValue'), componentOpacityValue=document.getElementById('componentOpacityValue');
const treePanel=document.getElementById('treePanel'), pdfWorkspace=document.getElementById('pdfWorkspace'), pdfEditorBar=document.getElementById('pdfEditorBar');
const threeControls=document.getElementById('threeControls'), regularControls=document.getElementById('regularControls'), pdfSaveSplit=document.getElementById('pdfSaveSplit');
const viewerTitle=document.getElementById('viewerTitle'), viewerSubtitle=document.getElementById('viewerSubtitle');
let THREE=null,threeRuntimePromise=null,regularPdfViewer=null,regularPdfViewerPromise=null;
let currentDesktopPath=null,currentReadOnly=false;
let renderer, scene, cam, pivot, modelRoot, solidGroup, wireGroup, renderPending=false;
let viewWidth=0, viewHeight=0, viewPixelRatio=0;
let ownedGeometries=[], ownedMaterials=[], threeGeometries=[], solidObjects=[], wireObjects=[];
let wireMaterial, currentDocumentScene=null, materialCache=new Map(), nodeOpacity=[], modelOpacity=1;
let componentNodes=[], treeRows=new Map(), treeEntries=new Map();
let nodeRefreshPending=false;
const selectedNodes=new Set(), hiddenNodes=new Set(), deletedNodes=new Set();
let raycaster,pointerNdc,defaultViewEuler,viewQuaternion,rotationDelta,rotationAxis,viewAxis;
let dragInverseQuaternion,dragOrbitWorld,dragOrbitLocal,rotatedOrbitLocal,zoomPlane,zoomAnchor;
let dist=3, modelRadius=1;
let initialFitPending=false, initialFitGeneration=0;
let pointerAction=null, pointerMoved=false, px=0, py=0, downX=0, downY=0;
let lastCanvasSelectAt=-Infinity, lastCanvasSelectX=0, lastCanvasSelectY=0;
const nanoWorker=createWorkerTaskClient(new URL('./nano-prc-worker.mjs',import.meta.url),{
  name:'excelsis-3dpdf-geometry',
  defaultTimeoutMs:10*60*1000,
});
const u3dPdfWorker=createWorkerTaskClient(new URL('./u3d-pdf-worker.mjs',import.meta.url),{
  name:'excelsis-u3d-pdf-extractor',
  defaultTimeoutMs:10*60*1000,
});
async function ensureThreeRuntime(){
  if(THREE)return THREE;
  if(!threeRuntimePromise)threeRuntimePromise=import('./vendor/runtime.mjs').then(module=>{
    THREE=module.THREE;
    raycaster=new THREE.Raycaster();pointerNdc=new THREE.Vector2();
    defaultViewEuler=new THREE.Euler(-0.5,0.6,0);
    viewQuaternion=new THREE.Quaternion().setFromEuler(defaultViewEuler);
    rotationDelta=new THREE.Quaternion();rotationAxis=new THREE.Vector3();viewAxis=new THREE.Vector3(0,0,1);
    dragInverseQuaternion=new THREE.Quaternion();dragOrbitWorld=new THREE.Vector3();
    dragOrbitLocal=new THREE.Vector3();rotatedOrbitLocal=new THREE.Vector3();
    zoomPlane=new THREE.Plane(new THREE.Vector3(0,0,1),0);zoomAnchor=new THREE.Vector3();
    return THREE;
  }).catch(error=>{threeRuntimePromise=null;throw error;});
  return threeRuntimePromise;
}
async function ensureRegularPdfViewer(){
  if(regularPdfViewer)return regularPdfViewer;
  if(!regularPdfViewerPromise)regularPdfViewerPromise=import('./regular-pdf.mjs').then(({createRegularPdfViewer})=>{
    regularPdfViewer=createRegularPdfViewer({
      onModeChange:setViewerMode,
      onStatus:text=>{stats.textContent=text;},
      onPathChange:(filePath,lockState)=>{
        currentDesktopPath=filePath;
        setLockState(lockState||{path:filePath,readOnly:false});
      },
    });
    regularPdfViewer.setReadOnly(currentReadOnly);
    return regularPdfViewer;
  }).catch(error=>{regularPdfViewerPromise=null;throw error;});
  return regularPdfViewerPromise;
}
function setViewerMode(mode){
  const regular=mode==='regular';
  treePanel.hidden=regular;drop.hidden=regular;pdfWorkspace.hidden=!regular;
  pdfEditorBar.hidden=!regular;
  threeControls.hidden=regular;regularControls.hidden=!regular;pdfSaveSplit.hidden=!regular;
  viewerTitle.textContent=regular?'PDF viewer':'3D PDF viewer';
  viewerSubtitle.textContent=regular?'Document':'3D model';
  if(regular&&modelRoot)disposeModel();
}
function initGL(){
  renderer = new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0xf7eded,1);
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(45,1,0.01,1e6);
  scene.add(new THREE.AmbientLight(0xffffff,0.7));
  scene.add(new THREE.HemisphereLight(0xffffff,0x8f777c,0.65));
  const d1=new THREE.DirectionalLight(0xffffff,0.65); d1.position.set(1,1.5,1); scene.add(d1);
  const d2=new THREE.DirectionalLight(0xffffff,0.25); d2.position.set(-1,-0.6,-1); scene.add(d2);
  pivot=new THREE.Group(); scene.add(pivot);
  resize(); addEventListener('resize',resizeAndFitDuringLoad);
  new ResizeObserver(resizeAndFitDuringLoad).observe(drop);
}
function resizeAndFitDuringLoad(){if(resize()&&modelRoot&&initialFitPending)fitView();}
function cancelInitialFit(){initialFitPending=false;initialFitGeneration++;}
function scheduleInitialFit(){
  const generation=++initialFitGeneration;
  initialFitPending=true;
  let lastWidth=-1,lastHeight=-1,stableFrames=0,attempts=0;
  const settle=()=>{
    if(generation!==initialFitGeneration||!initialFitPending||!modelRoot)return;
    const changed=resize();
    if(viewWidth===lastWidth&&viewHeight===lastHeight)stableFrames++;
    else{lastWidth=viewWidth;lastHeight=viewHeight;stableFrames=0;}
    if(changed)fitView();
    attempts++;
    if(stableFrames>=2||attempts>=12){fitView();initialFitPending=false;return;}
    requestAnimationFrame(settle);
  };
  requestAnimationFrame(settle);
}
function resize(){
  if(!renderer) return false;
  const w=Math.max(drop.clientWidth,1),h=Math.max(drop.clientHeight,1),pixelRatio=Math.min(devicePixelRatio,2);
  if(w===viewWidth&&h===viewHeight&&pixelRatio===viewPixelRatio)return false;
  viewWidth=w;viewHeight=h;viewPixelRatio=pixelRatio;
  renderer.setPixelRatio(pixelRatio); renderer.setSize(w,h,false);
  cam.aspect=w/h; cam.updateProjectionMatrix(); invalidate();
  return true;
}
function disposeModel(){
  cancelInitialFit();
  if(modelRoot){ pivot.remove(modelRoot); modelRoot=null; wireGroup=null; }
  for(const geometry of ownedGeometries) geometry.dispose();
  for(const material of ownedMaterials) material.dispose();
  ownedGeometries=[]; ownedMaterials=[]; threeGeometries=[]; solidObjects=[]; wireObjects=[];
  currentDocumentScene=null; componentNodes=[]; treeRows=new Map(); treeEntries=new Map();
  materialCache=new Map(); nodeOpacity=[]; modelOpacity=1;
  selectedNodes.clear(); hiddenNodes.clear(); deletedNodes.clear();
  componentTree.innerHTML='<div class="tree-empty">No model loaded</div>';
  selectionCount.textContent='0 selected';
}
function threeGeometry(source){
  let positions=source.positions,indices=source.indices;
  if(!positions||!indices){
    positions=new Float32Array(source.vertices.length*3);
    for(let i=0;i<source.vertices.length;i++){
      const vertex=source.vertices[i],offset=i*3;
      positions[offset]=vertex[0];positions[offset+1]=vertex[1];positions[offset+2]=vertex[2];
    }
    const IndexArray=source.vertices.length>65535?Uint32Array:Uint16Array;
    indices=new IndexArray(source.triangles.length*3);
    for(let i=0;i<source.triangles.length;i++){
      const triangle=source.triangles[i],offset=i*3;
      indices[offset]=triangle[0];indices[offset+1]=triangle[1];indices[offset+2]=triangle[2];
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setIndex(new THREE.BufferAttribute(indices,1));
  if(source.normals)geometry.setAttribute('normal',new THREE.BufferAttribute(source.normals,3));
  else{geometry.computeVertexNormals();geometry.normalizeNormals();}
  if(source.bounds){
    geometry.boundingBox=new THREE.Box3(
      new THREE.Vector3(source.bounds.minX,source.bounds.minY,source.bounds.minZ),
      new THREE.Vector3(source.bounds.maxX,source.bounds.maxY,source.bounds.maxZ),
    );
    const center=geometry.boundingBox.getCenter(new THREE.Vector3());
    const radius=Math.hypot(
      Math.max(Math.abs(source.bounds.minX-center.x),Math.abs(source.bounds.maxX-center.x)),
      Math.max(Math.abs(source.bounds.minY-center.y),Math.abs(source.bounds.maxY-center.y)),
      Math.max(Math.abs(source.bounds.minZ-center.z),Math.abs(source.bounds.maxZ-center.z)),
    );
    geometry.boundingSphere=new THREE.Sphere(center,radius);
  }else{geometry.computeBoundingBox();geometry.computeBoundingSphere();}
  ownedGeometries.push(geometry);
  return geometry;
}
function applyNodeMatrix(object, matrix){
  if(Array.isArray(matrix)&&matrix.length===16)object.matrix.fromArray(matrix);
  else object.matrix.set(...matrix.flat());
  object.matrixAutoUpdate=false;
}
function exactModelBounds({visibleOnly=true,world=false}={}){
  const box=new THREE.Box3(); box.makeEmpty();
  const point=new THREE.Vector3();
  for(const object of solidObjects){
    if(visibleOnly&&!object.visible)continue;
    const positions=object.geometry.getAttribute('position'),matrix=world?object.matrixWorld:object.matrix;
    for(let index=0;index<positions.count;index++)box.expandByPoint(point.fromBufferAttribute(positions,index).applyMatrix4(matrix));
  }
  return box;
}
function centerModelPivot(){
  if(currentDocumentScene?.modelCenter){
    const center=currentDocumentScene.modelCenter;
    modelRoot.position.set(-center.x,-center.y,-center.z);
    return;
  }
  const box=exactModelBounds({visibleOnly:false});
  if(box.isEmpty())return;
  const center=box.getCenter(new THREE.Vector3());
  modelRoot.position.set(-center.x,-center.y,-center.z);
}
function exactModelRadius({visibleOnly=true}={}){
  if(currentDocumentScene?.nodes?.every(node=>Number.isFinite(node.radiusFromModelCenter))){
    let radius=0;
    for(let index=0;index<solidObjects.length;index++){
      if(visibleOnly&&!solidObjects[index].visible)continue;
      radius=Math.max(radius,currentDocumentScene.nodes[index]?.radiusFromModelCenter||0);
    }
    return radius;
  }
  let radiusSquared=0;
  const point=new THREE.Vector3();
  for(const object of solidObjects){
    if(visibleOnly&&!object.visible)continue;
    const positions=object.geometry.getAttribute('position');
    for(let index=0;index<positions.count;index++){
      point.fromBufferAttribute(positions,index).applyMatrix4(object.matrixWorld);
      radiusSquared=Math.max(radiusSquared,point.lengthSq());
    }
  }
  return Math.sqrt(radiusSquared);
}
function updateCameraClipping(){
  if(!cam)return;
  const margin=Math.max(modelRadius*1.15,1);
  // Cursor-pivot rotation moves the assembly center in world space. Keep the
  // frustum centered on that transformed depth instead of assuming z=0.
  const centerDepth=dist-(pivot?.position.z||0);
  const near=Math.max(0.01,centerDepth-margin);
  const far=Math.max(near+1,centerDepth+margin);
  if(Math.abs(cam.near-near)>1e-6||Math.abs(cam.far-far)>1e-6){cam.near=near;cam.far=far;cam.updateProjectionMatrix();}
}
function fitView(){
  if(!modelRoot || !cam) return;
  pivot.position.set(0,0,0); pivot.quaternion.copy(viewQuaternion);
  scene.updateMatrixWorld(true);
  const radius=exactModelRadius();
  if(!Number.isFinite(radius)||radius<=0)return;
  const padding=1.2, verticalFov=cam.fov*Math.PI/180;
  const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*Math.max(cam.aspect,0.01));
  const limitingHalfFov=Math.max(Math.min(verticalFov,horizontalFov)*0.5,0.01);
  modelRadius=Math.max(radius*padding,1);
  dist=modelRadius/Math.sin(limitingHalfFov);
  updateCameraClipping();
  cam.position.set(0,0,dist); cam.lookAt(0,0,0);
  invalidate();
}
function ensureWireframe(){
  if(!currentDocumentScene || wireObjects.length) return;
  const wireGeometries=threeGeometries.map((geometry,index)=>{
    const prepared=currentDocumentScene.geometries[index]?.wireIndices;
    if(!prepared){
      const result=new THREE.WireframeGeometry(geometry);ownedGeometries.push(result);return result;
    }
    const result=new THREE.BufferGeometry();
    result.setAttribute('position',geometry.getAttribute('position'));
    result.setIndex(new THREE.BufferAttribute(prepared,1));
    ownedGeometries.push(result);
    return result;
  });
  for(const [nodeIndex,node] of currentDocumentScene.nodes.entries()){
    const wire=new THREE.LineSegments(wireGeometries[node.geometry],wireMaterial);
    applyNodeMatrix(wire,node.matrix); wire.userData.nodeIndex=nodeIndex;
    wireGroup.add(wire); wireObjects.push(wire);
  }
  refreshNodeState();
}
function materialForNode(index){
  const selected=selectedNodes.has(index);
  const opacity=Math.max(0.01,Math.min(1,modelOpacity*(nodeOpacity[index]??1)));
  const key=`${Number(selected)}:${opacity.toFixed(3)}`;
  if(materialCache.has(key))return materialCache.get(key);
  const material=new THREE.MeshStandardMaterial({
    color:selected?0xe04456:0xd8dade,
    emissive:selected?0x3d0911:0x111111,
    emissiveIntensity:selected?0.3:0.06,
    metalness:0,
    roughness:0.82,
    side:THREE.DoubleSide,
    transparent:opacity<0.999,
    opacity,
    depthWrite:opacity>=0.999,
  });
  materialCache.set(key,material); ownedMaterials.push(material);
  return material;
}
function refreshOpacityControls(){
  modelOpacityInput.value=String(modelOpacity); modelOpacityValue.textContent=`${Math.round(modelOpacity*100)}%`;
  componentOpacityInput.disabled=!selectedNodes.size;
  if(!selectedNodes.size){componentOpacityValue.textContent='-';return;}
  const values=[...selectedNodes].map(index=>nodeOpacity[index]??1);
  const first=values[0],mixed=values.some(value=>Math.abs(value-first)>1e-6);
  if(!mixed)componentOpacityInput.value=String(first);
  componentOpacityValue.textContent=mixed?'Mixed':`${Math.round(first*100)}%`;
}
function refreshTreeState(){
  const directComponents=new Set([...selectedNodes].map(index=>currentDocumentScene?.nodes[index]?.occurrence));
  for(const [componentIndex,row] of treeRows){
    const nodes=componentNodes[componentIndex] || [];
    const selected=nodes.reduce((count,index)=>count+Number(selectedNodes.has(index)),0);
    row.classList.toggle('selected',nodes.length>0 && selected===nodes.length);
    row.classList.toggle('partial',selected>0 && selected<nodes.length);
    row.classList.toggle('direct-selected',directComponents.has(componentIndex));
    row.classList.toggle('hidden',nodes.length>0 && nodes.every(index=>hiddenNodes.has(index)||deletedNodes.has(index)));
    row.classList.toggle('deleted',nodes.length>0 && nodes.every(index=>deletedNodes.has(index)));
  }
}
function refreshNodeState(){
  for(let index=0;index<solidObjects.length;index++){
    const visible=!hiddenNodes.has(index) && !deletedNodes.has(index);
    solidObjects[index].visible=visible;
    solidObjects[index].material=materialForNode(index);
    if(wireObjects[index]) wireObjects[index].visible=visible;
  }
  selectionCount.textContent=`${selectedNodes.size} selected`;
  for(const id of ['hideSelected','isolateSelected','deleteSelected']) document.getElementById(id).disabled=!selectedNodes.size;
  refreshTreeState();
  refreshOpacityControls();
  invalidate();
}
function scheduleNodeRefresh(){
  if(nodeRefreshPending)return;
  nodeRefreshPending=true;
  requestAnimationFrame(()=>{
    nodeRefreshPending=false;
    if(currentDocumentScene)refreshNodeState();
  });
}
function openTreeEntry(entry){
  if(!entry?.hasChildren)return;
  entry.populate();
  entry.childList.hidden=false;
  entry.toggle.setAttribute('aria-expanded','true');
  entry.toggle.textContent='-';
}
function revealNodeInTree(nodeIndex){
  const node=currentDocumentScene?.nodes[nodeIndex];
  if(!node)return;
  for(const componentIndex of node.path||[]){
    openTreeEntry(treeEntries.get(componentIndex));
  }
  const row=treeRows.get(node.occurrence)||[...(node.path||[])].reverse().map(index=>treeRows.get(index)).find(Boolean);
  if(row){
    const treeRect=componentTree.getBoundingClientRect(),rowRect=row.getBoundingClientRect();
    const top=treeRect.top+4,bottom=treeRect.bottom-4;
    if(rowRect.top<top) componentTree.scrollTop=Math.max(0,componentTree.scrollTop+rowRect.top-top);
    else if(rowRect.bottom>bottom) componentTree.scrollTop+=rowRect.bottom-bottom;
  }
}
function chooseNodes(indexes,{additive=false,toggle=false,revealNode=null}={}){
  if(!additive && !toggle) selectedNodes.clear();
  const active=indexes.filter(index=>!deletedNodes.has(index));
  if(toggle){
    const remove=active.length>0 && active.every(index=>selectedNodes.has(index));
    for(const index of active) remove?selectedNodes.delete(index):selectedNodes.add(index);
  }else{
    for(const index of active) selectedNodes.add(index);
  }
  refreshNodeState();
  if(revealNode!==null)revealNodeInTree(revealNode);
}
function renderComponentTree(documentScene){
  componentTree.replaceChildren(); treeRows=new Map(); treeEntries=new Map();
  componentNodes=documentScene.componentNodes||documentScene.components.map(()=>[]);
  if(!documentScene.componentNodes){
    for(const [nodeIndex,node] of documentScene.nodes.entries()){
      for(const componentIndex of node.path || []) if(componentNodes[componentIndex]) componentNodes[componentIndex].push(nodeIndex);
    }
  }
  const mounted=new Set();
  function branch(componentIndex,depth){
    const component=documentScene.components[componentIndex];
    if(!component || mounted.has(componentIndex)) return null;
    mounted.add(componentIndex);
    const item=document.createElement('li');
    const row=document.createElement('div'); row.className='tree-row'; row.dataset.component=String(componentIndex); treeRows.set(componentIndex,row);
    const toggle=document.createElement('button'); toggle.className='tree-toggle'; toggle.type='button';
    const label=document.createElement('button'); label.className='tree-label'; label.type='button'; label.textContent=component.name; label.title=component.name;
    row.append(toggle,label); item.append(row);
    const childList=document.createElement('ul');
    const hasChildren=Array.isArray(component.sons)&&component.sons.length>0;
    const entry={componentIndex,depth,item,row,toggle,childList,hasChildren,populated:false,populate:null};
    entry.populate=()=>{
      if(entry.populated||!entry.hasChildren)return;
      entry.populated=true;
      const fragment=document.createDocumentFragment();
      for(const son of component.sons){const child=branch(son,depth+1);if(child)fragment.append(child);}
      childList.append(fragment);
      if(!childList.childElementCount){entry.hasChildren=false;toggle.textContent='.';toggle.disabled=true;}
    };
    treeEntries.set(componentIndex,entry);
    if(hasChildren){
      toggle.textContent='+';toggle.setAttribute('aria-expanded','false');childList.hidden=true;
      toggle.addEventListener('click',()=>{
        const next=toggle.getAttribute('aria-expanded')!=='true';
        if(next)openTreeEntry(entry);
        else{toggle.setAttribute('aria-expanded','false');toggle.textContent='+';childList.hidden=true;}
      });
      item.append(childList);
    }else{ toggle.textContent='.'; toggle.disabled=true; }
    label.addEventListener('click',event=>chooseNodes(componentNodes[componentIndex]||[],{additive:event.shiftKey,toggle:event.ctrlKey||event.metaKey}));
    if(hasChildren&&depth<2)openTreeEntry(entry);
    return item;
  }
  const list=document.createElement('ul');
  const root=branch(documentScene.rootOccurrence,0); if(root) list.append(root);
  componentTree.append(list);
  refreshNodeState();
}
function renderFrame(){
  renderPending=false;
  if(pivot)pivot.quaternion.copy(viewQuaternion);
  if(cam){cam.position.z=dist;updateCameraClipping();}
  if(renderer) renderer.render(scene,cam);
}
function invalidate(){if(renderPending||!renderer)return;renderPending=true;requestAnimationFrame(renderFrame);}
function showDocumentScene(documentScene){
  setViewerMode('three');
  if(!renderer) initGL();
  cv.style.display='block'; hint.style.display='none';
  disposeModel();
  currentDocumentScene=documentScene;
  modelOpacity=1; nodeOpacity=new Array(documentScene.nodes.length).fill(1); materialCache=new Map();
  modelRoot=new THREE.Group(); solidGroup=new THREE.Group(); wireGroup=new THREE.Group(); wireGroup.visible=true;
  modelRoot.add(solidGroup,wireGroup); pivot.add(modelRoot);
  wireMaterial=new THREE.LineBasicMaterial({color:0x111111,transparent:true,opacity:0.8,depthTest:true,depthWrite:false});
  ownedMaterials.push(wireMaterial);
  threeGeometries=documentScene.geometries.map(threeGeometry);
  for(const [nodeIndex,node] of documentScene.nodes.entries()){
    const solid=new THREE.Mesh(threeGeometries[node.geometry],materialForNode(nodeIndex));
    applyNodeMatrix(solid,node.matrix); solid.userData.nodeIndex=nodeIndex;
    solidGroup.add(solid); solidObjects.push(solid);
  }
  renderComponentTree(documentScene);
  ensureWireframe();
  document.getElementById('edges').setAttribute('aria-pressed','true');
  centerModelPivot(); viewQuaternion.setFromEuler(defaultViewEuler);
  fitView();
}
function raycastAt(event){
  if(!solidObjects.length) return;
  const rect=cv.getBoundingClientRect();
  pointerNdc.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
  cam.position.z=dist; cam.updateMatrixWorld(true); scene.updateMatrixWorld(true); raycaster.setFromCamera(pointerNdc,cam);
  return raycaster.intersectObjects(solidObjects.filter(object=>object.visible),false)[0]||null;
}
function beginRotation(event){
  const hit=raycastAt(event);
  dragInverseQuaternion.copy(viewQuaternion).invert();
  if(hit)dragOrbitLocal.copy(hit.point).sub(pivot.position).applyQuaternion(dragInverseQuaternion);
  else dragOrbitLocal.set(0,0,0);
  dragOrbitWorld.copy(dragOrbitLocal).applyQuaternion(viewQuaternion).add(pivot.position);
}
function updateRotation(event){
  if(event.altKey){
    const rect=cv.getBoundingClientRect(),centerX=rect.left+rect.width*0.5,centerY=rect.top+rect.height*0.5;
    const sx=px-centerX,sy=centerY-py,ex=event.clientX-centerX,ey=centerY-event.clientY;
    const startRadius=Math.hypot(sx,sy),endRadius=Math.hypot(ex,ey);
    const angle=Math.min(startRadius,endRadius)>8?Math.atan2(sx*ey-sy*ex,sx*ex+sy*ey):-(event.clientX-px)*0.01;
    rotationDelta.setFromAxisAngle(viewAxis,angle);
  }else{
    const dx=event.clientX-px,dy=event.clientY-py;
    const radiansPerPixel=2/Math.max(Math.min(cv.clientWidth,cv.clientHeight),1);
    const angle=Math.hypot(dx,dy)*radiansPerPixel;
    if(angle<=1e-12)return;
    // Screen-space CAD rotation matching the original/SOLIDWORKS drag direction.
    rotationAxis.set(dy,dx,0).normalize();
    rotationDelta.setFromAxisAngle(rotationAxis,angle);
  }
  viewQuaternion.premultiply(rotationDelta).normalize();
  rotatedOrbitLocal.copy(dragOrbitLocal).applyQuaternion(viewQuaternion);
  pivot.position.copy(dragOrbitWorld).sub(rotatedOrbitLocal);
}
function pointerZoomAnchor(event){
  const hit=raycastAt(event);
  if(hit)return zoomAnchor.copy(hit.point);
  zoomPlane.constant=-pivot.position.z;
  return raycaster.ray.intersectPlane(zoomPlane,zoomAnchor)||zoomAnchor.copy(pivot.position);
}
function selectAt(event){
  const hit=raycastAt(event);
  if(hit){ const nodeIndex=hit.object.userData.nodeIndex;chooseNodes([nodeIndex],{additive:event.shiftKey,toggle:event.ctrlKey||event.metaKey,revealNode:nodeIndex}); }
  else if(!event.shiftKey && !event.ctrlKey && !event.metaKey) chooseNodes([]);
}
cv.addEventListener('pointerdown',event=>{
  if(event.button===0) pointerAction='select';
  else if(event.button===1) pointerAction='rotate';
  else if(event.button===2) pointerAction='pan';
  else return;
  cancelInitialFit();
  pointerMoved=false; px=downX=event.clientX; py=downY=event.clientY;
  if(pointerAction==='rotate')beginRotation(event);
  cv.setPointerCapture(event.pointerId); event.preventDefault();
});
cv.addEventListener('pointermove',event=>{
  if(!pointerAction) return;
  const dx=event.clientX-px,dy=event.clientY-py;
  if(Math.hypot(event.clientX-downX,event.clientY-downY)>3) pointerMoved=true;
  if(pointerAction==='rotate'&&pointerMoved)updateRotation(event);
  if(pointerAction==='pan'&&pointerMoved){
    const viewDepth=Math.max(dist-pivot.position.z,modelRadius*0.01);
    const unitsPerPixel=2*viewDepth*Math.tan(cam.fov*Math.PI/360)/Math.max(drop.clientHeight,1);
    pivot.position.x+=dx*unitsPerPixel; pivot.position.y-=dy*unitsPerPixel;
  }
  if(pointerAction==='rotate'||pointerAction==='pan')invalidate();
  px=event.clientX; py=event.clientY;
});
cv.addEventListener('pointerup',event=>{
  if(pointerAction==='select'&&!pointerMoved){
    const repeated=!event.shiftKey&&!event.ctrlKey&&!event.metaKey&&
      event.timeStamp-lastCanvasSelectAt<400&&Math.hypot(event.clientX-lastCanvasSelectX,event.clientY-lastCanvasSelectY)<6;
    if(!repeated){
      selectAt(event); lastCanvasSelectAt=event.timeStamp;
      lastCanvasSelectX=event.clientX; lastCanvasSelectY=event.clientY;
    }
  }
  pointerAction=null;
  if(cv.hasPointerCapture(event.pointerId)) cv.releasePointerCapture(event.pointerId);
});
cv.addEventListener('pointercancel',()=>{pointerAction=null;});
cv.addEventListener('dblclick',event=>{event.preventDefault();event.stopImmediatePropagation();});
cv.addEventListener('contextmenu',event=>event.preventDefault());
cv.addEventListener('wheel',event=>{
  event.preventDefault();
  cancelInitialFit();
  const anchor=pointerZoomAnchor(event),oldDist=dist;
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?Math.max(drop.clientHeight,1):1);
  const minDist=Math.max(modelRadius*0.08,anchor.z+modelRadius*0.01);
  const nextDist=Math.min(modelRadius*100,Math.max(minDist,dist*Math.exp(delta*0.001)));
  const oldDepth=oldDist-anchor.z,newDepth=nextDist-anchor.z;
  if(oldDepth>1e-6&&newDepth>1e-6){const scale=newDepth/oldDepth;pivot.position.x+=anchor.x*(scale-1);pivot.position.y+=anchor.y*(scale-1);}
  dist=nextDist;
  invalidate();
},{passive:false});
async function handleFile(file){
  const desktopPath=await desktopApi?.getPathForFile?.(file);
  if(desktopPath){ await releaseDesktopFile(); await decodeDesktopFile({path:desktopPath,name:file.name}); return; }
  await releaseDesktopFile();
  await decodeBuffer(await file.arrayBuffer(),file.name);
}
async function decodeBuffer(buf,label,{checkPrc=true,filePath=null}={}){
  stats.textContent='opening...';
  try{
    await new Promise(resolve=>requestAnimationFrame(resolve));
    if(checkPrc&&(looksLikePrcPdf(buf)||looksLikeU3dPdf(buf)))throw new Error('3D PDF decoding requires a local file path.');
    const viewer=await ensureRegularPdfViewer();
    await viewer.load(new Uint8Array(buf),label,filePath);
  }catch(err){ stats.textContent = 'error: ' + err.message; console.error(err); }
}
async function decodeNanoPath(filePath,label){
  if(regularPdfViewer)await regularPdfViewer.clear();
  setViewerMode('three');
  stats.textContent='decoding 3D model with nanoPRC...';
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const [payload]=await Promise.all([desktopApi.decodePrc(filePath),ensureThreeRuntime()]);
  const mesh=payload.mesh instanceof ArrayBuffer
    ?payload.mesh
    :payload.mesh.buffer.slice(payload.mesh.byteOffset,payload.mesh.byteOffset+payload.mesh.byteLength);
  const decoded=await nanoWorker.run('decode-nanoprc',{manifest:payload.manifest,mesh},{
    transfer:[mesh],
    timeoutMs:10*60*1000,
  });
  showDocumentScene(decoded);
  stats.textContent=label+' - '+decoded.vertexCount.toLocaleString()+' verts, '+
    decoded.triangleCount.toLocaleString()+' tris, '+decoded.instanceCount+
    ' part(s), '+decoded.uniqueRecordCount+' unique mesh(es) - nanoPRC';
  scheduleInitialFit();
}
async function decodeU3dPath(filePath,label){
  if(regularPdfViewer)await regularPdfViewer.clear();
  setViewerMode('three');
  stats.textContent='extracting embedded U3D model...';
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const pdf=await desktopApi.readFile(filePath);
  const extracted=await u3dPdfWorker.run('extract-u3d',{pdf},{
    transfer:[pdf],
    timeoutMs:10*60*1000,
  });
  stats.textContent='decoding 3D model with U3D...';
  const [payload]=await Promise.all([
    desktopApi.decodeU3d(filePath,extracted.bytes),
    ensureThreeRuntime(),
  ]);
  const mesh=payload.mesh instanceof ArrayBuffer
    ?payload.mesh
    :payload.mesh.buffer.slice(payload.mesh.byteOffset,payload.mesh.byteOffset+payload.mesh.byteLength);
  const decoded=await nanoWorker.run('decode-3d-scene',{manifest:payload.manifest,mesh},{
    transfer:[mesh],
    timeoutMs:10*60*1000,
  });
  showDocumentScene(decoded);
  const streamNote=extracted.streamCount>1?` (first of ${extracted.streamCount} U3D streams)`:'';
  stats.textContent=label+' - '+decoded.vertexCount.toLocaleString()+' verts, '+
    decoded.triangleCount.toLocaleString()+' tris, '+decoded.instanceCount+
    ' part(s), '+decoded.uniqueRecordCount+' unique mesh(es) - U3D'+streamNote;
  scheduleInitialFit();
}
const desktopApi=window.pdfApp?.isDesktop?window.pdfApp:null;
const lockStateEl=document.getElementById('lockState');
function fileNameFromPath(filePath){return String(filePath||'').split(/[\\/]/).pop()||'3D PDF';}
function setLockState(lockState){
  const readOnly=!!lockState?.readOnly;
  currentReadOnly=readOnly;
  lockStateEl.textContent=desktopApi?(readOnly?'Read-only: open in another window':'Writable'):'Local';
  lockStateEl.classList.toggle('read-only',readOnly);
  regularPdfViewer?.setReadOnly(readOnly);
}
async function releaseDesktopFile(){
  currentDesktopPath=null;
  if(desktopApi?.releaseFile) await desktopApi.releaseFile();
  setLockState({readOnly:false});
}
async function decodeDesktopFile(fileInfo){
  if(!desktopApi||!fileInfo?.path)return;
  currentDesktopPath=fileInfo.path;
  if(desktopApi.claimFile)setLockState(await desktopApi.claimFile(fileInfo.path));
  const label=fileInfo.name||fileNameFromPath(fileInfo.path);
  stats.textContent='opening...';
  try{
    const format=await desktopApi.detect3d(fileInfo.path);
    if(format==='prc')await decodeNanoPath(fileInfo.path,label);
    else if(format==='u3d')await decodeU3dPath(fileInfo.path,label);
    else await decodeBuffer(await desktopApi.readFile(fileInfo.path),label,{checkPrc:false,filePath:fileInfo.path});
  }catch(err){stats.textContent='error: '+err.message;console.error(err);}
}
document.getElementById('file').addEventListener('change',async event=>{const file=event.target.files[0];if(file)await handleFile(file);});
const sel=document.getElementById('sampleSel');
async function initDesktopBridge(){
  if(!desktopApi){setLockState({readOnly:false});return false;}
  sel.hidden=true;
  desktopApi.onFileState(lockState=>{if(lockState?.path===currentDesktopPath)setLockState(lockState);});
  desktopApi.onFileSaved(async savedState=>{if(savedState?.path===currentDesktopPath)await decodeDesktopFile({path:currentDesktopPath,name:fileNameFromPath(currentDesktopPath)});});
  try{
    const fileSet=await desktopApi.getInitialFileSet();
    const initial=fileSet?.files?.[fileSet.index??0]||(fileSet?.path?{path:fileSet.path,name:fileNameFromPath(fileSet.path)}:null);
    if(initial?.path){await decodeDesktopFile(initial);return true;}
  }catch(error){stats.textContent='error: '+(error.message||error);console.error(error);}
  return false;
}
async function startViewer(){await initDesktopBridge();}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',startViewer,{once:true});else startViewer();
document.getElementById('fit').addEventListener('click',()=>{cancelInitialFit();fitView();});
document.getElementById('edges').addEventListener('click',event=>{
  if(!wireGroup)return;
  ensureWireframe();wireGroup.visible=!wireGroup.visible;
  event.currentTarget.setAttribute('aria-pressed',String(wireGroup.visible));invalidate();
});
document.getElementById('hideSelected').addEventListener('click',()=>{for(const index of selectedNodes)hiddenNodes.add(index);refreshNodeState();});
document.getElementById('isolateSelected').addEventListener('click',()=>{
  if(!selectedNodes.size)return;
  for(let index=0;index<solidObjects.length;index++)selectedNodes.has(index)?hiddenNodes.delete(index):hiddenNodes.add(index);
  refreshNodeState(); cancelInitialFit();fitView();
});
document.getElementById('showAll').addEventListener('click',()=>{hiddenNodes.clear();refreshNodeState();cancelInitialFit();fitView();});
modelOpacityInput.addEventListener('input',()=>{
  modelOpacity=Number(modelOpacityInput.value);
  if(wireMaterial)wireMaterial.opacity=0.8*modelOpacity;
  modelOpacityValue.textContent=`${Math.round(modelOpacity*100)}%`;
  scheduleNodeRefresh();
});
componentOpacityInput.addEventListener('input',()=>{
  const opacity=Number(componentOpacityInput.value);
  for(const index of selectedNodes)nodeOpacity[index]=opacity;
  componentOpacityValue.textContent=`${Math.round(opacity*100)}%`;
  scheduleNodeRefresh();
});
function deleteSelection(){for(const index of selectedNodes)deletedNodes.add(index);selectedNodes.clear();refreshNodeState();}
document.getElementById('deleteSelected').addEventListener('click',deleteSelection);
addEventListener('keydown',event=>{
  if(event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement)return;
  if(event.key==='Delete')deleteSelection();
  if(event.key==='Escape')chooseNodes([]);
});
drop.addEventListener('dragover', e=>{e.preventDefault(); drop.classList.add('drag');});
drop.addEventListener('dragleave', ()=>drop.classList.remove('drag'));
drop.addEventListener('drop',async event=>{event.preventDefault();drop.classList.remove('drag');if(event.dataTransfer.files[0])await handleFile(event.dataTransfer.files[0]);});
pdfWorkspace.addEventListener('dragover',event=>event.preventDefault());
pdfWorkspace.addEventListener('drop',async event=>{event.preventDefault();if(event.dataTransfer.files[0])await handleFile(event.dataTransfer.files[0]);});
addEventListener('beforeunload',()=>{nanoWorker.dispose();u3dPdfWorker.dispose();},{once:true});
