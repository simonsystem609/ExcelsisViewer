import assert from 'node:assert/strict';
import { rewriteTextStream, removePageText } from '../modules/3dpdf/pdf-content-edit.mjs';
import * as runtime from '../modules/3dpdf/vendor/pdf-edit/pdf-export-runtime.mjs';
const bytes = text => Uint8Array.from(text,c=>c.charCodeAt(0));
const text = data => String.fromCharCode(...data);
const glyphs=new Map([...` ABCD0123456789`].map(char=>[char.charCodeAt(0),{width:500,unicode:char,isSpace:char===' '}]));
const fonts=new Map([['helvetica',{composite:false,glyphs}]]);
const options={fonts,resolveFont:()=> 'Helvetica',regions:[{x:49,y:46,width:17,height:17}]};
for(const source of ['BT /F1 12 Tf 1 0 0 1 50 50 Tm (ABC) Tj (D) Tj ET',
  'BT /F1 12 Tf 1 0 0 1 50 50 Tm <414243> Tj (D) Tj ET',
  'BT /F1 12 Tf 1 0 0 1 50 50 Tm [(A) 0 (B) 0 (C)] TJ (D) Tj ET',
  'BT /F1 12 Tf 1 0 0 1 50 50 Tm (A\\102C) Tj (D) Tj ET']){
  const result=rewriteTextStream(bytes(source),options);assert.equal(result.removed,1);
  assert.match(text(result.bytes),/\[-1500\] TJ \(D\) Tj/);assert.equal(result.unknown,0);
}
const composite=new Map([['helvetica',{composite:true,glyphs}]]);
assert.equal(rewriteTextStream(bytes('BT /F1 12 Tf 1 0 0 1 50 50 Tm <004100420043> Tj ET'),{...options,fonts:composite}).removed,1);
assert.equal(rewriteTextStream(bytes('q 1 0 0 1 100 100 cm BT /F1 12 Tf 1 0 0 1 50 50 Tm (ABC) Tj ET Q'),options).removed,0,'Other placements are not removed');
assert.throws(()=>rewriteTextStream(bytes('BI /W 1 ID xxx EI'),options),/Inline-image/);
assert.throws(()=>rewriteTextStream(bytes('BT (broken'),options),/Unclosed/);
const {PDFDocument}=runtime;const StandardFonts={Helvetica:'Helvetica'};
const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),page=doc.addPage([300,400]);
page.drawText('ABC',{x:50,y:50,size:12,font});page.drawText('D',{x:150,y:50,size:12,font});
const saved=await doc.save();const loaded=await PDFDocument.load(saved);
assert.equal(removePageText(loaded.getPage(0),[{x:49,y:46,width:23,height:20}],fonts,runtime).removed,1);
const content=loaded.getPage(0).node.Contents().asArray().map(ref=>runtime.decodePDFRawStream(loaded.context.lookup(ref)).decode());
assert(content.every(data=>!text(data).includes('414243')),'Original glyph strings are gone');
assert(content.some(data=>text(data).includes('44')),'Other text is preserved');
const formDoc=await PDFDocument.create(),formFont=await formDoc.embedFont('Helvetica'),formPage=formDoc.addPage([300,400]);
const resource=formDoc.context.obj({Font:{F1:formFont.ref}});
const formRef=formDoc.context.register(formDoc.context.flateStream('BT /F1 12 Tf 1 0 0 1 50 50 Tm (ABC) Tj ET',{
  Type:'XObject',Subtype:'Form',BBox:[0,0,200,200],Resources:resource,
}));
formPage.node.set(runtime.PDFName.of('Resources'),formDoc.context.obj({XObject:{Fm1:formRef}}));
formPage.node.set(runtime.PDFName.of('Contents'),formDoc.context.register(formDoc.context.flateStream('/Fm1 Do q 1 0 0 1 100 100 cm /Fm1 Do Q')));
const formLoaded=await PDFDocument.load(await formDoc.save());
assert.equal(removePageText(formLoaded.getPage(0),[{x:49,y:46,width:23,height:20}],fonts,runtime).removed,1,'Only the selected shared-form placement changes');
console.log(JSON.stringify({passed:true,nativeStringsRemoved:true,cursorAdvancePreserved:true,hexAndLiteralAndTJ:true,unicodeCID:true,otherPlacementsPreserved:true,malformedFailsSafely:true}));
