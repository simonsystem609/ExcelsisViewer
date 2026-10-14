// Independently authored, bounded PDF text-stream editing (AGPL-3.0-or-later).
// Removes glyph strings, preserving cursor advance and all nontext operators.
const LIMIT = 32 * 1024 * 1024;
const identity = () => [1,0,0,1,0,0];
const multiply = (a,b) => [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
const number = n => Number.isFinite(n) ? Number(n.toFixed(8)).toString() : '0';
const fontKey = name => String(name||'').replace(/^\//,'').toLowerCase();
function latin(bytes) {
  let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return result;
}
function tokens(source) {
  let i=0;
  const space = c => /[\0\t\n\f\r ]/.test(c||'');
  function skip(){while(i<source.length){if(space(source[i]))i++;else if(source[i]==='%'){while(i<source.length&&!/[\r\n]/.test(source[i]))i++;}else break;}}
  function read(){
    skip();if(i>=source.length)return null;
    const start=i,c=source[i++];
    if(c==='('){
      const bytes=[];let depth=1;
      while(i<source.length&&depth){let ch=source[i++];
        if(ch==='\\'){
          ch=source[i++];if(ch==='\r'||ch==='\n'){if(ch==='\r'&&source[i]==='\n')i++;continue;}
          if(/[0-7]/.test(ch||'')){let octal=ch;for(let k=0;k<2&&/[0-7]/.test(source[i]||'');k++)octal+=source[i++];bytes.push(parseInt(octal,8)&255);}
          else bytes.push(({n:10,r:13,t:9,b:8,f:12})[ch]??ch?.charCodeAt(0)??0);
        }else if(ch==='('){depth++;bytes.push(40);}else if(ch===')'){if(--depth)bytes.push(41);}else bytes.push(ch.charCodeAt(0));
      }
      if(depth)throw Error('Unclosed PDF string');return {kind:'bytes',value:bytes,start,end:i};
    }
    if(c==='<'&&source[i]!=='<'){
      const end=source.indexOf('>',i);if(end<0)throw Error('Unclosed PDF hex string');
      let hex=source.slice(i,end).replace(/\s/g,'');if(!/^[0-9a-f]*$/i.test(hex))throw Error('Invalid PDF hex string');if(hex.length%2)hex+='0';
      const bytes=[];for(let n=0;n<hex.length;n+=2)bytes.push(parseInt(hex.slice(n,n+2),16));i=end+1;return {kind:'bytes',value:bytes,start,end:i};
    }
    if(c==='['){const values=[];while(true){skip();if(source[i]===']'){i++;break;}const item=read();if(!item)throw Error('Unclosed PDF array');values.push(item);}return {kind:'array',value:values,start,end:i};}
    if(c==='<'&&source[i]==='<'){
      i++;let depth=1;while(i<source.length&&depth){skip();if(source.slice(i,i+2)==='>>'){i+=2;depth--;}else if(source.slice(i,i+2)==='<<'){i+=2;depth++;}else read();}
      if(depth)throw Error('Unclosed PDF dictionary');return {kind:'other',start,end:i};
    }
    if(c==='/'){while(i<source.length&&!space(source[i])&&!/[()[\]<>/%]/.test(source[i]))i++;return {kind:'name',value:source.slice(start+1,i).replace(/#([0-9a-f]{2})/gi,(_,h)=>String.fromCharCode(parseInt(h,16))),start,end:i};}
    while(i<source.length&&!space(source[i])&&!/[()[\]<>/%]/.test(source[i]))i++;
    if(i===start+1&&/[()[\]<>]/.test(c))throw Error('Invalid PDF delimiter');
    const word=source.slice(start,i);return {kind:/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(word)?'number':'word',value:/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(word)?Number(word):word,start,end:i};
  }
  const result=[];for(let token;(token=read());)result.push(token);return result;
}
const overlap = (a,b) => Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
export function rewriteTextStream(bytes, {fonts,resolveFont,regions,ctm=identity(),form}={}) {
  if(bytes.length>LIMIT)throw Error('The PDF content stream is too large to edit safely.');
  const source=latin(bytes),changes=[],stack=[];let operands=[],state={ctm,tm:identity(),lm:identity(),font:null,size:0,spacing:0,wordSpacing:0,hscale:1,leading:0,rise:0};
  let removed=0,unknown=0;
  const moveLine=(x,y)=>{state.lm=multiply(state.lm,[1,0,0,1,x,y]);state.tm=[...state.lm];};
  for(const token of tokens(source)){
    if(token.kind!=='word'){operands.push(token);continue;}
    const op=token.value,v=operands.map(t=>t.value),start=operands[0]?.start??token.start;
    if(op==='BI')throw Error('Inline-image PDF streams need area whiteout instead of native text removal.');
    if(op==='q')stack.push({...state,ctm:[...state.ctm],tm:[...state.tm],lm:[...state.lm]});
    else if(op==='Q'){if(stack.length)state=stack.pop();}
    else if(op==='cm'&&v.length===6)state.ctm=multiply(state.ctm,v);
    else if(op==='BT'){state.tm=identity();state.lm=identity();}
    else if(op==='Tf'){state.font=resolveFont?.(v[0]);state.size=v[1];}
    else if(op==='Tc')state.spacing=v[0];else if(op==='Tw')state.wordSpacing=v[0];
    else if(op==='Tz')state.hscale=v[0]/100;else if(op==='TL')state.leading=v[0];else if(op==='Ts')state.rise=v[0];
    else if(op==='Tm'&&v.length===6){state.tm=[...v];state.lm=[...v];}
    else if(op==='Td'||op==='TD'){if(op==='TD')state.leading=-v[1];moveLine(v[0],v[1]);}
    else if(op==='T*')moveLine(0,-state.leading);
    else if(op==='Do'&&form){const name=form(v[0],state.ctm);if(name)changes.push({start,end:token.end,text:`/${name} Do`});}
    else if(['Tj','TJ',"'",'"'].includes(op)){
      if(op==="'"||op==='"')moveLine(0,-state.leading);
      if(op==='"'){state.wordSpacing=v[0];state.spacing=v[1];}
      const items=op==='TJ'?operands[0]?.value:[operands.at(-1)];
      const font=fonts?.get(fontKey(state.font));let advance=0,valid=!!font&&!font.vertical,codes=[],decoded='';
      for(const item of items||[]){
        if(item.kind==='number'){advance-=item.value/1000*state.size*state.hscale;continue;}
        if(item.kind!=='bytes'){valid=false;continue;}
        const count=font?.composite?2:1;
        if(item.value.length%count)valid=false;
        for(let i=0;i<item.value.length;i+=count){const code=count===2?item.value[i]*256+item.value[i+1]:item.value[i],glyph=font?.glyphs.get(code);codes.push(code);
          if(!glyph){valid=false;continue;}decoded+=glyph.unicode||'';
          advance+=(glyph.width/1000*state.size+state.spacing+(glyph.isSpace?state.wordSpacing:0))*state.hscale;
        }
      }
      const matrix=multiply(state.ctm,state.tm),x=matrix[4]+matrix[2]*state.rise,y=matrix[5]+matrix[3]*state.rise;
      const height=Math.hypot(matrix[2],matrix[3])*state.size;
      const endX=x+matrix[0]*advance,endY=y+matrix[1]*advance;
      const box={x:Math.min(x,endX)-height*.15,y:Math.min(y,endY)-height*.35,width:Math.abs(endX-x)+height*.3,height:Math.abs(endY-y)+height*1.5};
      const hit=decoded.trim()&&regions.some(region=>overlap(box,region)>Math.min(box.width*box.height,region.width*region.height)*.45);
      if(hit&&valid&&state.size>0&&state.hscale){
        const shift=-advance/(state.size*state.hscale)*1000;
        const prefix=op==='"'?`${number(state.wordSpacing)} Tw\n${number(state.spacing)} Tc\nT*\n`:op==="'"?'T*\n':'';
        changes.push({start,end:token.end,text:`${prefix}[${number(shift)}] TJ`});removed++;
      }else if(hit&&!valid)unknown++;
      if(valid)state.tm=multiply(state.tm,[1,0,0,1,advance,0]);
    }
    operands=[];
  }
  let result=source;for(const change of changes.sort((a,b)=>b.start-a.start))result=result.slice(0,change.start)+change.text+result.slice(change.end);
  return {bytes:Uint8Array.from(result,c=>c.charCodeAt(0)),removed,unknown,changed:changes.length>0};
}

export function removePageText(page,regions,sourceFonts,runtime) {
  if(!regions.length)return {removed:0};
  const {PDFName,PDFDict,PDFArray,PDFRawStream,decodePDFRawStream}=runtime;
  const context=page.doc.context,name=PDFName.of;
  const resources=page.node.Resources();
  let removed=0,unknown=0,visited=0;
  function process(stream,resource,ctm,depth){
    if(depth>16||++visited>4096)throw Error('PDF form nesting is too complex to edit safely.');
    if(!(stream instanceof PDFRawStream))throw Error('Unsupported PDF text content stream.');
    const fontDictionary=resource?.lookupMaybe(name('Font'),PDFDict),xobjects=resource?.lookupMaybe(name('XObject'),PDFDict);
    let editedResources=null,editedXobjects=null;
    const result=rewriteTextStream(decodePDFRawStream(stream).decode(),{fonts:sourceFonts,regions,ctm,
      resolveFont:key=>{const font=fontDictionary?.lookupMaybe(name(key),PDFDict);return font?.lookupMaybe(name('BaseFont'),PDFName)?.decodeText()||font?.lookupMaybe(name('FontDescriptor'),PDFDict)?.lookupMaybe(name('FontName'),PDFName)?.decodeText();},
      form:(key,matrix)=>{
        const child=xobjects?.lookupMaybe(name(key),PDFRawStream);if(child?.dict.lookupMaybe(name('Subtype'),PDFName)?.decodeText()!=='Form')return null;
        const formMatrix=child.dict.lookupMaybe(name('Matrix'),PDFArray)?.asArray().map(n=>context.lookup(n).asNumber())||identity();
        const childResources=child.dict.lookupMaybe(name('Resources'),PDFDict)||resource;
        const rewritten=process(child,childResources,multiply(matrix,formMatrix),depth+1);if(!rewritten.changed)return null;
        if(!editedResources){editedResources=resource.clone(context);editedXobjects=xobjects.clone(context);editedResources.set(name('XObject'),editedXobjects);}
        let newKey=`ExcelsisTextEdit${visited}`;while(editedXobjects.has(name(newKey)))newKey+='_';
        editedXobjects.set(name(newKey),context.register(rewritten.stream));return newKey;
      }});
    removed+=result.removed;unknown+=result.unknown;
    if(!result.changed&&!editedResources)return {changed:false,stream};
    const entries={};for(const [key,value]of stream.dict.entries()){const text=key.decodeText();if(!['Filter','DecodeParms','Length'].includes(text))entries[text]=value;}
    if(editedResources)entries.Resources=editedResources;
    return {changed:true,stream:context.flateStream(result.bytes,entries),resources:editedResources};
  }
  const contents=page.node.Contents();const refs=contents instanceof PDFArray?contents.asArray():contents?[page.node.get(name('Contents'))]:[];
  // Contents arrays are one continuous PDF program: state can cross stream
  // boundaries. Do not reset fonts/matrices between those streams.
  const chunks=refs.map(ref=>{const stream=context.lookup(ref);if(!(stream instanceof PDFRawStream))throw Error('Unsupported PDF content stream.');return decodePDFRawStream(stream).decode();});
  const length=chunks.reduce((n,c)=>n+c.length+1,0);if(length>LIMIT)throw Error('This page is too complex to edit safely.');
  const combined=new Uint8Array(length);let offset=0;for(const chunk of chunks){combined.set(chunk,offset);offset+=chunk.length;combined[offset++]=10;}
  const rewritten=process(context.flateStream(combined),resources,identity(),0);
  if(unknown)throw Error('Some original text could not be removed safely. Use Whiteout for a visual cover instead; the original file has not changed.');
  if(!removed)throw Error('The original text could not be located for replacement. The original file has not changed.');
  page.node.set(name('Contents'),context.obj([context.register(rewritten.stream)]));if(rewritten.resources)page.node.set(name('Resources'),rewritten.resources);
  return {removed};
}
